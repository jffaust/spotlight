// From: https://stackoverflow.com/a/66383599

using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;

/**
* Error handling: throw HTTPException(s) in business logic, generate correct response with correct httpStatusCode + short error messages.
* If the exception is a server error (status 5XX), this exception is logged.
*/

namespace Spotlight.Website.Middlewares
{

    internal class HttpExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<HttpExceptionMiddleware> _logger;

        public HttpExceptionMiddleware(RequestDelegate next, ILogger<HttpExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next.Invoke(context);
            }
            catch (HttpException e)
            {
                var response = context.Response;
                if (response.HasStarted)
                {
                    throw;
                }

                int statusCode = (int)e.StatusCode;
                if (statusCode >= 500 && statusCode <= 599)
                {
                    _logger.LogError(e, "Server exception");
                }
                response.Clear();
                response.StatusCode = statusCode;
                response.ContentType = "application/json; charset=utf-8";
                response.Headers[HeaderNames.CacheControl] = "no-cache";
                response.Headers[HeaderNames.Pragma] = "no-cache";
                response.Headers[HeaderNames.Expires] = "-1";
                response.Headers.Remove(HeaderNames.ETag);

                var bodyObj = new
                {
                    Message = e.Message,
                    Status = e.StatusCode.ToString()
                };
                var body = JsonSerializer.Serialize(bodyObj);
                await context.Response.WriteAsync(body);
            }
        }
    }
}