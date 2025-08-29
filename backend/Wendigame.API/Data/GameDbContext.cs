using Microsoft.EntityFrameworkCore;
using WendigoGame.API.Models;

namespace WendigoGame.API.Data;

public class GameDbContext : DbContext
{
    public GameDbContext(DbContextOptions<GameDbContext> options) : base(options)
    {
    }
    
    public DbSet<Game> Games { get; set; }
    public DbSet<Player> Players { get; set; }
    public DbSet<Role> Roles { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuration des relations
        modelBuilder.Entity<Game>()
            .HasMany(g => g.Players)
            .WithOne(p => p.Game)
            .HasForeignKey(p => p.GameId);
            
        modelBuilder.Entity<Player>()
            .HasOne(p => p.Role)
            .WithMany(r => r.Players)
            .HasForeignKey(p => p.RoleId);
            
        // Index pour les performances
        modelBuilder.Entity<Game>()
            .HasIndex(g => g.Status);
            
        modelBuilder.Entity<Player>()
            .HasIndex(p => new { p.GameId, p.IsAlive });
    }
}
