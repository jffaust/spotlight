using System;
using Spotlight.Website.Database;

namespace Spotlight.Website.Models
{
    public class Dataset
    {
        public Guid Id { get; set; }
        public string Scope { get; set; }
        public string Path { get; set; }
        public int Size { get; set; }
        public DateTimeOffset LastModified { get; set; }

        //description
        //etc

        public Dataset(DatasetEntity e)
        {
            Id = Guid.ParseExact(e.PartitionKey, "D");
            Scope = e.Scope;
            Path = e.Path;
            Size = e.Size;
            LastModified = e.Timestamp != null ? (DateTimeOffset)e.Timestamp : DateTimeOffset.MinValue;
        }
    }
}