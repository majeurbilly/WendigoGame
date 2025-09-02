using Microsoft.EntityFrameworkCore;
using WendigoGame.API.Data;
using WendigoGame.API.Services;
using WendigoGame.API.Hubs;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuration de la base de données
builder.Services.AddDbContext<WendigoGameContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configuration de SignalR
builder.Services.AddSignalR();

// Configuration CORS pour Flutter
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFlutter", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Enregistrement des services
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<ILobbyService, LobbyService>();

// Configuration de la journalisation
builder.Services.AddLogging();

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Configuration CORS
app.UseCors("AllowFlutter");

// Configuration des routes
app.UseRouting();

// Configuration des contrôleurs
app.MapControllers();

// Configuration de SignalR
app.MapHub<GameHub>("/gamehub");

// Création de la base de données si elle n'existe pas
using (IServiceScope scope = app.Services.CreateScope())
{
    WendigoGameContext context = scope.ServiceProvider.GetRequiredService<WendigoGameContext>();
    try
    {
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        ILogger<Program> logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Erreur lors de la création de la base de données");
    }
}

app.Run();
