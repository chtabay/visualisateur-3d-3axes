<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { indicators as defaultIndicators } from '$lib/data/indicators';
  import ThreeAxisChart from '$lib/components/ThreeAxisChart.svelte';
  
  let indicators = [];
  let indicator = null;
  
  $: slug = $page.params.slug;
  $: if (indicators.length > 0) {
    indicator = indicators.find(i => i.id === slug);
  }
  
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
  <title>{indicator?.title || 'Indicateur'} - Visualisateur 3D</title>
</svelte:head>

<div class="container">
  <nav class="breadcrumb">
    <a href="{base}/">← Retour aux indicateurs</a>
    {#if indicator}
      <a href="{base}/admin?edit={indicator.id}">Modifier cet indicateur</a>
    {/if}
  </nav>

  {#if indicator}
    <div class="chart-wrapper">
      <ThreeAxisChart {indicator} />
    </div>
  {:else}
    <div class="error">
      <h2>Indicateur introuvable</h2>
      <p>L'indicateur avec l'ID "{slug}" n'existe pas.</p>
      <a href="{base}/" class="btn btn-primary">Retour à l'accueil</a>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .breadcrumb {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .breadcrumb a {
    color: #3b82f6;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    background: white;
    font-weight: 500;
    transition: all 0.2s;
  }

  .breadcrumb a:hover {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .chart-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; /* Important pour que le flex fonctionne correctement */
  }

  .error {
    text-align: center;
    padding: 4rem;
  }

  .error h2 {
    color: #ef4444;
    margin-bottom: 1rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    display: inline-block;
    margin-top: 1rem;
  }

  .btn:hover {
    background: #2563eb;
  }
</style>
