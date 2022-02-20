using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using SpoofyAPI;
using SpotifyAPI.Web;
using Swashbuckle.AspNetCore.SwaggerGen;
using static SpotifyAPI.Web.Scopes;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton(SpotifyClientConfig.CreateDefault());
builder.Services.AddScoped<SpotifyClientBuilder>();

// Configure Spotify authentication
builder.Services.AddAuthorization(options => {
    options.AddPolicy("Spotify", policy => {
        policy.AuthenticationSchemes.Add("Spotify");
        policy.RequireAuthenticatedUser();
    });
});

builder.Services.AddAuthentication(options => {
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
}).AddCookie(options => {
    options.ExpireTimeSpan = TimeSpan.FromMinutes(50);
}).AddSpotify(options => {
    options.ClientId = builder.Configuration["Spotify:ClientID"];
    options.ClientSecret = builder.Configuration["Spotify:ClientSecret"];
    options.SaveTokens = true;

    var scopes = new List<string>() {
        UserReadEmail, PlaylistModifyPrivate, PlaylistReadPrivate
    };

    options.Scope.Add(string.Join(",", scopes));
});

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options => {
    options.SwaggerDoc("v1", new OpenApiInfo {
        Version = "v1",
        Title = "SpoofyAPI",
        Description = "Authenticate: <a target='_blank' href='/authentication/login'>click here</a>"
    });
});

var app = builder.Build();

// Fix OAuth against HTTP localhost
if (app.Environment.IsDevelopment()) {
    app.UseCookiePolicy(new CookiePolicyOptions() {
        MinimumSameSitePolicy = SameSiteMode.Lax
    });
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.UseAuthentication();

app.MapControllers();

app.Run();