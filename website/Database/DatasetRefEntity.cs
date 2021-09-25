using System;
using Azure;
using Azure.Data.Tables;

namespace Spotlight.Website.Database
{
    public class DatasetRefEntity : ITableEntity
    {
        public DatasetRefEntity()
        {
        }

        public DatasetRefEntity(Guid guid, string scope, string path, int size)
        {
            // TODO: make sure to replace disallowed chars 
            // https://docs.microsoft.com/en-us/rest/api/storageservices/understanding-the-table-service-data-model#characters-disallowed-in-key-fields
            PartitionKey = scope;
            RowKey = path;
            DatasetId = guid;
            Size = size;
        }

        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public Guid DatasetId { get; set; }
        public int Size { get; set; }
    }
}