using System;
using Azure;
using Azure.Data.Tables;

namespace Spotlight.Website.Database
{
    public class DatasetEntity : ITableEntity
    {
        public DatasetEntity()
        {
        }

        public DatasetEntity(Guid guid, string scope, string path, int size)
        {
            PartitionKey = guid.ToString("D");
            RowKey = "tmp"; // had trouble deleting rows with empty rk
            Scope = scope;
            Path = path;
            Size = size;
        }

        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string Scope { get; set; }
        public string Path { get; set; }
        public int Size { get; set; }
    }
}