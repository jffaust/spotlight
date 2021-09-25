using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Azure;
using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Spotlight.Website.Models;

namespace Spotlight.Website.Database
{
    public class DatasetService : IDatasetService
    {
        private readonly TableClient _datasetsClient;
        private readonly TableClient _indexClient;
        private readonly BlobContainerClient _dataClient;

        public DatasetService(AppSettings settings)
        {
            _datasetsClient = new TableClient(settings.AzureStorageConnectionString, "Datasets");
            _indexClient = new TableClient(settings.AzureStorageConnectionString, "DatasetsIndex");
            _datasetsClient.CreateIfNotExists();
            _indexClient.CreateIfNotExists();

            _dataClient = new BlobContainerClient(settings.AzureStorageConnectionString, "datasets");

            if (!_dataClient.Exists())
            {
                _dataClient.CreateIfNotExists();
            }
        }

        public async Task<List<DatasetRef>> Browse(string scope, string path)
        {
            List<DatasetRef> references = new();

            var browsePath = path.Replace('/', '|');

            var lastChar = browsePath[^1];
            var asciiIncrementedChar = ((char)(Convert.ToUInt16(lastChar) + 1));
            var limitPath = browsePath[0..^1] + asciiIncrementedChar;

            var filter = $"PartitionKey eq '{scope.ToLower()}' and RowKey ge '{browsePath}' and RowKey lt '{limitPath}'";
            var entities = _indexClient.QueryAsync<DatasetRefEntity>(filter);

            await foreach (DatasetRefEntity e in entities)
            {
                references.Add(new DatasetRef(e));
            }

            return references;
        }

        public async Task<Dataset> SaveDataset(string scope, string path, string data)
        {
            var guid = Guid.NewGuid();
            var lowerScope = scope.ToLower();

            var blobClient = _dataClient.GetBlobClient(guid.ToString("D"));

            using (MemoryStream ms = new(Encoding.UTF8.GetBytes(data)))
            {
                var options = new BlobUploadOptions() { AccessTier = AccessTier.Cool };
                await blobClient.UploadAsync(ms, options);
            }

            var props = await blobClient.GetPropertiesAsync();

            var dataset = new DatasetEntity(guid, lowerScope, path, (int)props.Value.ContentLength);
            var datasetRef = new DatasetRefEntity(guid, lowerScope, path.Replace('/', '|'), (int)props.Value.ContentLength);

            await _datasetsClient.AddEntityAsync(dataset);
            await _indexClient.AddEntityAsync(datasetRef);

            return new Dataset(dataset);
        }

        public async Task<DatasetData> GetData(Guid datasetId)
        {
            var dataset = await _datasetsClient.GetEntityAsync<DatasetEntity>(datasetId.ToString("D"), Constants.DatasetRowKeyPlaceholder);

            if (dataset.Value == null)
            {
                return null;
            }

            var blobClient = _dataClient.GetBlobClient(datasetId.ToString("D"));
            var result = await blobClient.DownloadContentAsync();
            return new DatasetData(new DatasetRef(dataset.Value), result.Value.Content.ToString());
        }
    }
}