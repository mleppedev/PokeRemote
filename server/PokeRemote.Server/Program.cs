using PokeRemote.Core.WebRTC;
using PokeRemote.Server.Models;
using PokeRemote.Server.Hubs;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Agregar CORS para WebRTC
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Agregar SignalR para señalización WebRTC
builder.Services.AddSignalR(options => 
{
    options.EnableDetailedErrors = true;
});

// Servicio singleton para WebRTC
builder.Services.AddSingleton<WebRTCServer>();
builder.Services.AddLogging(configure => configure.AddConsole());

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Inicializar servicio WebRTC
var webRTCServer = app.Services.GetRequiredService<WebRTCServer>();
await webRTCServer.Initialize();

// Mapear el hub de SignalR
app.MapHub<Hubs.WebRTCHub>("/signalr/webrtc");

// Endpoints para señalización WebRTC
app.MapPost("/api/webrtc/offer", async (HttpContext context) =>
{
    using StreamReader reader = new(context.Request.Body);
    string body = await reader.ReadToEndAsync();
    var offer = JsonSerializer.Deserialize<SdpMessage>(body);

    if (offer != null)
    {        await webRTCServer.SetRemoteDescription("offer", offer.Sdp);
        // La respuesta SDP se maneja internamente en SetRemoteDescription
        return Results.Ok();
    }
    
    return Results.BadRequest();
});

app.MapPost("/api/webrtc/candidate", async (HttpContext context) =>
{
    using StreamReader reader = new(context.Request.Body);
    string body = await reader.ReadToEndAsync();
    var candidate = JsonSerializer.Deserialize<IceMessage>(body);

    if (candidate != null)
    {
        await webRTCServer.AddIceCandidate(candidate.Candidate, candidate.SdpMid, candidate.SdpMLineIndex);
        return Results.Ok();
    }
    
    return Results.BadRequest();
});

app.MapGet("/api/status", () => 
{
    return Results.Ok(new { status = "running", connected = webRTCServer.IsConnected });
});

Console.WriteLine("Servidor PokeRemote iniciado. Presiona Ctrl+C para salir.");
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
