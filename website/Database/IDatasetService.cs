using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure;
using Spotlight.Website.Models;

namespace Spotlight.Website.Database
{
    public interface IDatasetService
    {
        //Project FindOne(int id);
        Task<List<DatasetRef>> Browse(string scope, string path);
        Task<Dataset> SaveDataset(string scope, string path, string data);
        Task<DatasetData> GetData(Guid datasetId);
        //bool Update(WeatherForecast forecast);
        //int Delete(int id);
    }
}