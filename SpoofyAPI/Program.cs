using Microsoft.OpenApi.Models;
using SpoofyAPI;
using SpoofyAPI.Middleware;
using SpotifyAPI.Web;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy(
        name: "cors",
        builder => {
            builder.WithOrigins("http://localhost:3000");
            builder.WithOrigins("https://spoofy.noahc3.ml");
            builder.AllowAnyHeader();
            builder.AllowAnyMethod();
            builder.AllowCredentials();
        });
});

// Add services to the container.

builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton(SpotifyClientConfig.CreateDefault());
builder.Services.AddScoped<SpotifyClientBuilder>();

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger authentication
var scheme = new OpenApiSecurityScheme {
    Name = "oauth2",
    Type = SecuritySchemeType.OAuth2,
    In = ParameterLocation.Query,
    Scheme = "oauth2",
    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" },
    Flows = new OpenApiOAuthFlows {
        AuthorizationCode = new OpenApiOAuthFlow {
            AuthorizationUrl = new Uri("/authentication/login", UriKind.Relative),
            TokenUrl = new Uri("/authentication/token", UriKind.Relative)
        }
    }
};

builder.Services.AddSwaggerGen(options => {
    options.AddSecurityDefinition("oauth2", scheme);
    options.OperationFilter<SecureEndpointAuthRequirementFilter>(scheme);
});


// Build app

var app = builder.Build();

app.UseCors("cors");

// Register custom auth middleware
app.UseMiddleware<SpotifyAuthMiddleware>();

// Fix cookies against HTTP localhost
if (app.Environment.IsDevelopment()) {
    app.UseCookiePolicy(new CookiePolicyOptions() {
        MinimumSameSitePolicy = SameSiteMode.Lax
    });
}

// Configure Swagger UI
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI(options => {
        options.OAuthClientId(builder.Configuration["Spotify:ClientId"]);
        options.OAuthClientSecret(builder.Configuration["Spotify:ClientSecret"]);
    });
}

app.UseAuthorization();

app.MapControllers();

app.Run();

internal class SecureEndpointAuthRequirementFilter : IOperationFilter {
    OpenApiSecurityScheme scheme;
    public SecureEndpointAuthRequirementFilter(OpenApiSecurityScheme scheme) {
        this.scheme = scheme;
    }
    public void Apply(OpenApiOperation operation, OperationFilterContext context) {
        if (!context.ApiDescription
            .ActionDescriptor
            .EndpointMetadata
            .OfType<SpotifyAuthAttribute>()
            .Any()) {
            return;
        }

        operation.Security.Add(new OpenApiSecurityRequirement()
        {
            [scheme] = new List<string>()
        });
    }
}