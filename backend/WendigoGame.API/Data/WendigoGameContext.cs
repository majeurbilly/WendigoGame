using Microsoft.EntityFrameworkCore;
using WendigoGame.API.Models;

namespace WendigoGame.API.Data
{
    /// <summary>
    /// Contexte Entity Framework pour Wendigo Game
    /// </summary>
    public class WendigoGameContext : DbContext
    {
        public WendigoGameContext(DbContextOptions<WendigoGameContext> options) : base(options)
        {
        }

        // Tables principales
        public DbSet<Player> Players { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Lobby> Lobbies { get; set; }
        public DbSet<LobbyPlayer> LobbyPlayers { get; set; }
        public DbSet<LobbyMessage> LobbyMessages { get; set; }

        // Tables de support
        public DbSet<Vote> Votes { get; set; }
        public DbSet<PlayerAction> PlayerActions { get; set; }
        public DbSet<GameMessage> GameMessages { get; set; }
        public DbSet<PlayerNote> PlayerNotes { get; set; }
        public DbSet<GameEvent> GameEvents { get; set; }
        public DbSet<DisplayMessage> DisplayMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuration des entités

            // Player
            modelBuilder.Entity<Player>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
                entity.Property(p => p.UserId).IsRequired().HasMaxLength(100);
                entity.Property(p => p.GameId).IsRequired().HasMaxLength(100);
                entity.Property(p => p.ConnectionId).HasMaxLength(100);
                entity.Property(p => p.Color).HasMaxLength(7);
                
                // Relations
                entity.HasMany(p => p.Votes)
                      .WithOne()
                      .HasForeignKey(v => v.VoterId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(p => p.Actions)
                      .WithOne()
                      .HasForeignKey(a => a.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(p => p.Messages)
                      .WithOne()
                      .HasForeignKey(m => m.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(p => p.Notes)
                      .WithOne()
                      .HasForeignKey(n => n.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Game
            modelBuilder.Entity<Game>(entity =>
            {
                entity.HasKey(g => g.Id);
                entity.Property(g => g.Id).IsRequired().HasMaxLength(100);
                entity.Property(g => g.Name).IsRequired().HasMaxLength(100);
                entity.Property(g => g.LobbyId).IsRequired().HasMaxLength(100);
                
                // Relations
                entity.HasMany(g => g.GameEvents)
                      .WithOne()
                      .HasForeignKey(e => e.GameId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(g => g.GameMessages)
                      .WithOne()
                      .HasForeignKey(m => m.GameId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Lobby
            modelBuilder.Entity<Lobby>(entity =>
            {
                entity.HasKey(l => l.Id);
                entity.Property(l => l.Name).IsRequired().HasMaxLength(100);
                entity.Property(l => l.Description).HasMaxLength(500);
                entity.Property(l => l.CreatorId).IsRequired().HasMaxLength(100);
                entity.Property(l => l.Password).HasMaxLength(100);
                entity.Property(l => l.GameId).HasMaxLength(100);
                
                // Relations
                entity.HasMany(l => l.Players)
                      .WithOne()
                      .HasForeignKey(p => p.LobbyId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(l => l.Messages)
                      .WithOne()
                      .HasForeignKey(m => m.LobbyId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // LobbyPlayer
            modelBuilder.Entity<LobbyPlayer>(entity =>
            {
                entity.HasKey(lp => lp.Id);
                entity.Property(lp => lp.UserId).IsRequired().HasMaxLength(100);
                entity.Property(lp => lp.Name).IsRequired().HasMaxLength(100);
                entity.Property(lp => lp.LobbyId).IsRequired().HasMaxLength(100);
            });

            // LobbyMessage
            modelBuilder.Entity<LobbyMessage>(entity =>
            {
                entity.HasKey(lm => lm.Id);
                entity.Property(lm => lm.LobbyId).IsRequired().HasMaxLength(100);
                entity.Property(lm => lm.UserId).IsRequired().HasMaxLength(100);
                entity.Property(lm => lm.PlayerName).IsRequired().HasMaxLength(100);
                entity.Property(lm => lm.Content).IsRequired().HasMaxLength(1000);
            });

            // Vote
            modelBuilder.Entity<Vote>(entity =>
            {
                entity.HasKey(v => v.Id);
                entity.Property(v => v.VoterId).IsRequired().HasMaxLength(100);
                entity.Property(v => v.TargetPlayerId).IsRequired().HasMaxLength(100);
            });

            // PlayerAction
            modelBuilder.Entity<PlayerAction>(entity =>
            {
                entity.HasKey(pa => pa.Id);
                entity.Property(pa => pa.PlayerId).IsRequired().HasMaxLength(100);
                entity.Property(pa => pa.TargetPlayerId).HasMaxLength(100);
            });

            // GameMessage
            modelBuilder.Entity<GameMessage>(entity =>
            {
                entity.HasKey(gm => gm.Id);
                entity.Property(gm => gm.PlayerId).IsRequired().HasMaxLength(100);
                entity.Property(gm => gm.Content).IsRequired().HasMaxLength(1000);
            });

            // PlayerNote
            modelBuilder.Entity<PlayerNote>(entity =>
            {
                entity.HasKey(pn => pn.Id);
                entity.Property(pn => pn.PlayerId).IsRequired().HasMaxLength(100);
                entity.Property(pn => pn.TargetPlayerId).IsRequired().HasMaxLength(100);
                entity.Property(pn => pn.Content).IsRequired().HasMaxLength(2000);
            });

            // GameEvent
            modelBuilder.Entity<GameEvent>(entity =>
            {
                entity.HasKey(ge => ge.Id);
                entity.Property(ge => ge.GameId).IsRequired().HasMaxLength(100);
                entity.Property(ge => ge.PlayerId).HasMaxLength(100);
                entity.Property(ge => ge.TargetPlayerId).HasMaxLength(100);
                entity.Property(ge => ge.Description).IsRequired().HasMaxLength(500);
            });

            // DisplayMessage
            modelBuilder.Entity<DisplayMessage>(entity =>
            {
                entity.HasKey(dm => dm.Id);
                entity.Property(dm => dm.Content).IsRequired().HasMaxLength(1000);
            });

            // Configuration des enums
            modelBuilder.Entity<Player>()
                .Property(p => p.Team)
                .HasConversion<string>();

            modelBuilder.Entity<GameManager>()
                .Property(g => g.Status)
                .HasConversion<string>();

            modelBuilder.Entity<GameManager>()
                .Property(g => g.CurrentPhase)
                .HasConversion<string>();

            modelBuilder.Entity<Lobby>()
                .Property(l => l.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Vote>()
                .Property(v => v.VoteType)
                .HasConversion<string>();

            modelBuilder.Entity<PlayerAction>()
                .Property(pa => pa.ActionType)
                .HasConversion<string>();

            modelBuilder.Entity<GameMessage>()
                .Property(gm => gm.MessageType)
                .HasConversion<string>();

            modelBuilder.Entity<GameEvent>()
                .Property(ge => ge.EventType)
                .HasConversion<string>();

            modelBuilder.Entity<DisplayMessage>()
                .Property(dm => dm.Type)
                .HasConversion<string>();

            // Index pour les performances
            modelBuilder.Entity<Player>()
                .HasIndex(p => p.UserId);

            modelBuilder.Entity<Player>()
                .HasIndex(p => p.GameId);

            modelBuilder.Entity<LobbyPlayer>()
                .HasIndex(lp => lp.UserId);

            modelBuilder.Entity<LobbyPlayer>()
                .HasIndex(lp => lp.LobbyId);

            modelBuilder.Entity<GameEvent>()
                .HasIndex(ge => ge.GameId);

            modelBuilder.Entity<GameEvent>()
                .HasIndex(ge => ge.Timestamp);

            modelBuilder.Entity<Vote>()
                .HasIndex(v => v.VoterId);

            modelBuilder.Entity<PlayerAction>()
                .HasIndex(pa => pa.PlayerId);

            modelBuilder.Entity<GameMessage>()
                .HasIndex(gm => gm.PlayerId);
        }
    }
}
