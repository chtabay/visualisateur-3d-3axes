<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let indicators = [];
  let editingIndicator = null;
  let showIndicatorForm = false;
  let showPointForm = false;

  // Formulaire indicateur
  let indicatorForm = {
    id: '',
    title: '',
    axisX: { label: '', min: 0, max: 10 },
    axisY: { label: '', min: 0, max: 10 },
    axisZ: { label: '', min: 0, max: 10 }
  };

  // Formulaire point
  let pointForm = {
    label: '',
    x: 5,
    y: 5,
    z: 5,
    color: '#3b82f6'
  };

  let editingPointIndex = -1;

  onMount(async () => {
    await loadIndicators();
    
    // Vérifier si on doit éditer un indicateur existant
    const editId = $page.url.searchParams.get('edit');
    if (editId) {
      const indicator = indicators.find(i => i.id === editId);
      if (indicator) {
        startEditIndicator(indicator);
      }
    }
  });

  async function loadIndicators() {
    try {
      const response = await fetch('/api/indicators');
      indicators = await response.json();
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  }

  function startNewIndicator() {
    editingIndicator = null;
    indicatorForm = {
      id: '',
      title: '',
      axisX: { label: '', min: -10, max: 10 },
      axisY: { label: '', min: -10, max: 10 },
      axisZ: { label: '', min: -10, max: 10 }
    };
    showIndicatorForm = true;
  }

  function startEditIndicator(indicator) {
    editingIndicator = { ...indicator };
    indicatorForm = {
      id: indicator.id,
      title: indicator.title,
      axisX: { label: indicator.axisX.label, min: indicator.axisX.min || 0, max: indicator.axisX.max || 10 },
      axisY: { label: indicator.axisY.label, min: indicator.axisY.min || 0, max: indicator.axisY.max || 10 },
      axisZ: { label: indicator.axisZ.label, min: indicator.axisZ.min || 0, max: indicator.axisZ.max || 10 }
    };
    showIndicatorForm = true;
  }

  async function saveIndicator() {
    const newIndicator = {
      id: indicatorForm.id,
      title: indicatorForm.title,
      axisX: { label: indicatorForm.axisX.label, min: -10, max: 10 },
      axisY: { label: indicatorForm.axisY.label, min: -10, max: 10 },
      axisZ: { label: indicatorForm.axisZ.label, min: -10, max: 10 },
      data: editingIndicator?.data || []
    };

    try {
      const method = editingIndicator ? 'PUT' : 'POST';
      const response = await fetch('/api/indicators', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIndicator)
      });

      if (response.ok) {
        await loadIndicators();
        if (!editingIndicator) {
          // Si c'est un nouvel indicateur, on bascule en mode édition
          editingIndicator = newIndicator;
        }
        showIndicatorForm = false;
      } else {
        const error = await response.json();
        alert('Erreur: ' + error.error);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  function startNewPoint() {
    pointForm = {
      label: '',
      x: 5,
      y: 5,
      z: 5,
      color: '#3b82f6'
    };
    editingPointIndex = -1;
    showPointForm = true;
  }

  function startEditPoint(point, index) {
    pointForm = { ...point };
    editingPointIndex = index;
    showPointForm = true;
  }

  async function savePoint() {
    if (!editingIndicator) return;

    const newPoint = { ...pointForm };
    
    if (editingPointIndex >= 0) {
      editingIndicator.data[editingPointIndex] = newPoint;
    } else {
      editingIndicator.data.push(newPoint);
    }

    await updateIndicator();
    showPointForm = false;
  }

  async function deletePoint(index) {
    if (!editingIndicator) return;
    if (confirm('Supprimer ce point ?')) {
      editingIndicator.data.splice(index, 1);
      await updateIndicator();
    }
  }

  async function updateIndicator() {
    if (!editingIndicator) return;

    try {
      const response = await fetch('/api/indicators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingIndicator)
      });

      if (response.ok) {
        await loadIndicators();
        // Maintenir la référence d'édition
        const foundIndicator = indicators.find(i => i.id === editingIndicator.id);
        if (foundIndicator) {
          editingIndicator = foundIndicator;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  }

  async function deleteIndicator(indicator) {
    if (confirm(`Supprimer l'indicateur "${indicator.title}" ?`)) {
      try {
        const response = await fetch('/api/indicators', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: indicator.id })
        });

        if (response.ok) {
          await loadIndicators();
          if (editingIndicator?.id === indicator.id) {
            editingIndicator = null;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  }

  function generateId() {
    return indicatorForm.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  $: if (indicatorForm.title && !editingIndicator) {
    indicatorForm.id = generateId();
  }
</script>

<svelte:head>
  <title>Administration - Visualisateur 3D</title>
</svelte:head>

<div class="container">
  <header>
    <h1>Administration des Indicateurs</h1>
    <nav>
      <a href="/">← Retour à l'accueil</a>
    </nav>
  </header>

  <div class="admin-layout">
    <!-- Liste des indicateurs -->
    <div class="indicators-panel">
      <div class="panel-header">
        <h2>Indicateurs</h2>
        <button on:click={startNewIndicator} class="btn btn-primary">+ Nouvel indicateur</button>
      </div>
      
      <div class="indicators-list">
        {#each indicators as indicator}
          <div class="indicator-item" class:active={editingIndicator?.id === indicator.id}>
            <div class="indicator-info">
              <h3>{indicator.title}</h3>
              <span class="point-count">{indicator.data.length} points</span>
            </div>
            <div class="indicator-actions">
              <button on:click={() => startEditIndicator(indicator)} class="btn btn-sm">Éditer</button>
              <button on:click={() => deleteIndicator(indicator)} class="btn btn-sm btn-danger">Suppr.</button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Panneau d'édition -->
    <div class="edit-panel">
      {#if showIndicatorForm}
        <div class="form-section">
          <h3>{editingIndicator ? 'Modifier' : 'Créer'} un indicateur</h3>
          
          <div class="form-group">
            <label for="indicator-title">Titre</label>
            <input id="indicator-title" bind:value={indicatorForm.title} placeholder="Ex: Analyse produit 2024" />
          </div>

          <div class="form-group">
            <label for="indicator-id">ID (généré automatiquement)</label>
            <input id="indicator-id" bind:value={indicatorForm.id} readonly={!!editingIndicator} />
          </div>

          <div class="axes-config">
            <div class="form-group">
              <label for="axis-x">Axe X</label>
              <input id="axis-x" bind:value={indicatorForm.axisX.label} placeholder="Ex: Coût" />
            </div>
            
            <div class="form-group">
              <label for="axis-y">Axe Y</label>
              <input id="axis-y" bind:value={indicatorForm.axisY.label} placeholder="Ex: Qualité" />
            </div>
            
            <div class="form-group">
              <label for="axis-z">Axe Z</label>
              <input id="axis-z" bind:value={indicatorForm.axisZ.label} placeholder="Ex: Rapidité" />
            </div>
          </div>

          <div class="form-actions">
            <button on:click={saveIndicator} class="btn btn-primary">Sauvegarder</button>
            <button on:click={() => showIndicatorForm = false} class="btn">Annuler</button>
          </div>
        </div>
      {:else if editingIndicator}
        <div class="indicator-detail">
          <div class="detail-header">
            <h3>{editingIndicator.title}</h3>
            <div class="detail-actions">
              <button on:click={() => startEditIndicator(editingIndicator)} class="btn btn-sm">Modifier</button>
              <a href="/indicateur/{editingIndicator.id}" class="btn btn-sm btn-view">Voir</a>
            </div>
          </div>

          <div class="axes-info">
            <span><strong>X:</strong> {editingIndicator.axisX.label}</span>
            <span><strong>Y:</strong> {editingIndicator.axisY.label}</span>
            <span><strong>Z:</strong> {editingIndicator.axisZ.label}</span>
          </div>

          <div class="points-section">
            <div class="section-header">
              <h4>Points de données</h4>
              <button on:click={startNewPoint} class="btn btn-sm btn-primary">+ Ajouter</button>
            </div>

            {#if editingIndicator.data.length === 0}
              <p class="empty">Aucun point ajouté.</p>
            {:else}
              <div class="points-list">
                {#each editingIndicator.data as point, index}
                  <div class="point-item">
                    <div class="point-info">
                      <div class="color-dot" style="background-color: {point.color}"></div>
                      <span class="point-label">{point.label}</span>
                      <span class="point-coords">({point.x}, {point.y}, {point.z})</span>
                    </div>
                    <div class="point-actions">
                      <button on:click={() => startEditPoint(point, index)} class="btn btn-xs">Éditer</button>
                      <button on:click={() => deletePoint(index)} class="btn btn-xs btn-danger">Suppr.</button>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="empty-edit">
          <p>Sélectionnez un indicateur pour l'éditer ou créez-en un nouveau.</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Modal formulaire point -->
{#if showPointForm}
  <div class="modal-overlay" on:click={() => showPointForm = false} on:keydown={(e) => e.key === 'Escape' && (showPointForm = false)} role="dialog" tabindex="-1">
    <div class="modal" on:click|stopPropagation role="document">
      <h3>{editingPointIndex >= 0 ? 'Modifier' : 'Ajouter'} un point</h3>
      
      <div class="form-group">
        <label for="point-name">Nom</label>
        <input id="point-name" bind:value={pointForm.label} placeholder="Ex: Produit A" />
      </div>

      <div class="coordinates">
        <div class="form-group">
          <label for="point-x">{editingIndicator?.axisX.label || 'X'}</label>
          <input id="point-x" type="number" bind:value={pointForm.x} min="-10" max="10" step="0.1" />
        </div>
        
        <div class="form-group">
          <label for="point-y">{editingIndicator?.axisY.label || 'Y'}</label>
          <input id="point-y" type="number" bind:value={pointForm.y} min="-10" max="10" step="0.1" />
        </div>
        
        <div class="form-group">
          <label for="point-z">{editingIndicator?.axisZ.label || 'Z'}</label>
          <input id="point-z" type="number" bind:value={pointForm.z} min="-10" max="10" step="0.1" />
        </div>
      </div>

      <div class="form-group">
        <label for="point-color">Couleur</label>
        <input id="point-color" type="color" bind:value={pointForm.color} />
      </div>

      <div class="modal-actions">
        <button on:click={savePoint} class="btn btn-primary">Sauvegarder</button>
        <button on:click={() => showPointForm = false} class="btn">Annuler</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  header h1 {
    margin: 0;
  }

  header nav a {
    color: #3b82f6;
    text-decoration: none;
  }

  .admin-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    min-height: 600px;
  }

  .indicators-panel {
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .indicators-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .indicator-item {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
  }

  .indicator-item:hover,
  .indicator-item.active {
    background: #f8fafc;
  }

  .indicator-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
  }

  .point-count {
    font-size: 0.8rem;
    color: #666;
  }

  .indicator-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .edit-panel {
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    padding: 1.5rem;
  }

  .form-section h3,
  .indicator-detail h3 {
    margin: 0 0 1.5rem 0;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .axes-config {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .axis-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .min-max {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .min-max input {
    width: 100%;
    padding: 0.375rem;
    font-size: 0.8rem;
  }

  .coordinates {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }

  .form-actions,
  .modal-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .detail-actions {
    display: flex;
    gap: 0.5rem;
  }

  .axes-info {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h4 {
    margin: 0;
  }

  .points-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .point-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .point-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .point-coords {
    color: #666;
    font-size: 0.8rem;
  }

  .point-actions {
    display: flex;
    gap: 0.25rem;
  }

  .empty-edit,
  .empty {
    text-align: center;
    color: #666;
    padding: 2rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 500px;
    max-width: 90vw;
  }

  .modal h3 {
    margin: 0 0 1.5rem 0;
  }

  /* Boutons */
  .btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    text-decoration: none;
    color: #333;
    font-size: 0.9rem;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }

  .btn-view {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }

  .btn-xs {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }

  .btn:hover {
    opacity: 0.9;
  }
</style>
