using WendigoGame.API.Tests;
using WendigoGame.TestRunner;

Console.WriteLine("=== Wendigo Game - Tests et Simulation ===\n");

// 1. Exécuter les tests unitaires de base
Console.WriteLine("1. Tests unitaires de base:");
try
{
    ManualTest.ExecuterTousLesTests();
    Console.WriteLine("✅ Tous les tests unitaires sont passés !\n");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Test unitaire échoué: {ex.Message}");
    Environment.Exit(1);
}

// 2. Exécuter la simulation de partie complète
Console.WriteLine("2. Simulation d'une partie complète:");
try
{
    await GameSimulationRunner.ExecuterSimulation();
    Console.WriteLine("✅ Simulation de partie terminée avec succès !\n");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Simulation échouée: {ex.Message}");
    Environment.Exit(1);
}

Console.WriteLine("🎉 Tous les tests et simulations sont passés avec succès !");
Console.WriteLine("Le backend Wendigo Game est prêt pour l'intégration avec Flutter !");
