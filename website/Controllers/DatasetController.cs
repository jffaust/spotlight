using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using Spotlight.Website.Features;
using System.Threading.Tasks;
using Spotlight.Website.Database;

namespace Spotlight.Website.Controllers
{
    [TypeFilter(typeof(FeatureFlagFilter), Arguments = new object[] { Feature.Storage })]
    public class DatasetController : Controller
    {
        private readonly IDatasetService _datasetService;
        private readonly AppSettings _appSettings;

        public DatasetController(AppSettings settings, IDatasetService service)
        {
            _appSettings = settings;
            _datasetService = service;
        }

        [HttpGet]
        [Route("datasets")]
        public async Task<IActionResult> Browse([FromQuery] string scope, [FromQuery] string path)
        {
            var datasetRefs = await _datasetService.Browse(scope, path);
            return Ok(datasetRefs);
        }

        [HttpGet]
        [Route("datasets/{id:guid}/data")]
        public async Task<IActionResult> GetData(Guid id)
        {
            var datasetData = await _datasetService.GetData(id);
            return Ok(datasetData);
        }

        [HttpPost]
        [Route("datasets")]
        public async Task<IActionResult> SaveDataset([FromBody] NewDatasetPayload payload)
        {
            var dataset = await _datasetService.SaveDataset(payload.Scope, payload.Path, payload.Data);
            return Ok(dataset);
        }

    }

    public class NewDatasetPayload
    {
        public string Scope { get; set; }
        public string Path { get; set; }
        public string Data { get; set; } //JSON string of graph data
    }
}
