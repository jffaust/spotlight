using System.Collections.Generic;
using Spotlight.Website.Database;
using Spotlight.Website.Features;
using Spotlight.Website.Middlewares;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Prometheus;

namespace Spotlight.Website
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews()
                .AddJsonOptions(opts => opts.JsonSerializerOptions.PropertyNamingPolicy = null);

            var appSettings = new AppSettings()
            {
                DefaultNodeColor = Configuration["GRAPHIT_DEFAULT_NODE_COLOR"],
                AzureStorageConnectionString = Configuration["GRAPHIT_AZURE_STORAGE_CONNECTION"]
            };
            services.AddSingleton(appSettings);
            services.AddSingleton(new ClientAppSettings(appSettings));

            services.AddSingleton(new Dictionary<Feature, bool>()
            {
                { Feature.Storage, appSettings.StorageEnabled }
            });

            if (appSettings.StorageEnabled)
            {
                services.AddSingleton<IDatasetService, DatasetService>();
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseMetricServer();
            app.UseHttpMetrics();

            app.UseStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
                {
                    endpoints.MapControllerRoute(
                        name: "default",
                        pattern: "{controller=Home}/{action=Index}/{id?}");
                });

            app.UseMiddleware<HttpExceptionMiddleware>();
        }
    }
}
