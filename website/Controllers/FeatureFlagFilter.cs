using System;
using System.Collections.Generic;
using System.Net;
using Spotlight.Website;
using Spotlight.Website.Features;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Spotlight.Website.Controllers
{
    public class FeatureFlagFilter : IActionFilter
    {
        private readonly Feature _controllerFeature;
        private readonly Dictionary<Feature, bool> _availableFeatures;

        public FeatureFlagFilter(Dictionary<Feature, bool> availableFeatures, Feature controllerFeature)
        {
            _availableFeatures = availableFeatures;
            _controllerFeature = controllerFeature;
        }

        public void OnActionExecuting(ActionExecutingContext filterContext)
        {
            bool featureKnown = _availableFeatures.TryGetValue(_controllerFeature, out bool featureEnabled);

            if (!featureKnown)
            {
                throw new HttpException((int)HttpStatusCode.NotFound, $"Feature '{_controllerFeature}' is not known");
            }

            if (!featureEnabled)
            {
                throw new HttpException((int)HttpStatusCode.NotFound, $"Feature '{_controllerFeature}' is not enabled");
            }
        }

        public void OnActionExecuted(ActionExecutedContext context) { }
    }
}