using System;

namespace Spotlight.Website.Models
{
    public class DatasetData
    {
        public DatasetRef Ref { get; set; }
        public string Data { get; set; }

        public DatasetData(DatasetRef reference, string data)
        {
            Ref = reference;
            Data = data;
        }
    }
}