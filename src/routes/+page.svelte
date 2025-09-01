<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { indicators as defaultIndicators } from '$lib/data/indicators';
  
  let indicators = [];
  
  onMount(() => {
    // Charger depuis localStorage ou utiliser les données par défaut
    const savedData = localStorage.getItem('indicators');
    if (savedData) {
      try {
        indicators = JSON.parse(savedData);
      } catch (error) {
        console.warn('Erreur localStorage, utilisation des données par défaut');
        indicators = defaultIndicators;
      }
    } else {
      indicators = defaultIndicators;
    }
  });
</script>

<svelte:head>
  <title>Visualisateur 3D - Indicateurs</title>
</svelte:head>

<div class="container">
  <header>
    <h1>Visualisateur d'Indicateurs 3D</h1>
    <p>Gérez et visualisez vos données sur trois axes</p>
  </header>

  <nav>
    <a href="/admin" class="btn btn-primary">+ Nouveau Indicateur</a>
  </nav>

  <main>
    {#if indicators.length === 0}
      <div class="empty-state">
        <p>Aucun indicateur créé pour le moment.</p>
        <a href="{base}/admin" class="btn btn-primary">Créer le premier indicateur</a>
      </div>
    {:else}
      <div class="indicators-grid">
        {#each indicators as indicator}
          <div class="indicator-card">
            <h3>{indicator.title}</h3>
            <div class="indicator-info">
              <div class="axes">
                <span><strong>X:</strong> {indicator.axisX.label}</span>
                <span><strong>Y:</strong> {indicator.axisY.label}</span>
                <span><strong>Z:</strong> {indicator.axisZ.label}</span>
              </div>
              <div class="data-count">
                {indicator.data.length} point{indicator.data.length > 1 ? 's' : ''}
              </div>
            </div>
            <div class="card-actions">
              <a href="{base}/indicateur/{indicator.id}" class="btn btn-view" data-sveltekit-reload>Voir</a>
              <a href="{base}/admin?edit={indicator.id}" class="btn btn-edit">Modifier</a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
  }

  header h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  header p {
    color: #666;
    font-size: 1.1rem;
  }

  nav {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 2rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    display: inline-block;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-view {
    background: #10b981;
    color: white;
  }

  .btn-view:hover {
    background: #059669;
  }

  .btn-edit {
    background: #f59e0b;
    color: white;
  }

  .btn-edit:hover {
    background: #d97706;
  }

  .empty-state {
    text-align: center;
    padding: 4rem;
    color: #666;
  }

  .indicators-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .indicator-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .indicator-card h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.2rem;
  }

  .indicator-info {
    margin-bottom: 1.5rem;
  }

  .axes {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  .data-count {
    color: #666;
    font-size: 0.9rem;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
  }

  .card-actions .btn {
    flex: 1;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.9rem;
  }
</style>
