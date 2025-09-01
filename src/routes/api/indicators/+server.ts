import { json } from '@sveltejs/kit';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const INDICATORS_FILE = join(process.cwd(), 'src/lib/data/indicators.ts');

// Fonction utilitaire pour lire les indicateurs depuis le fichier
function readIndicators() {
  try {
    const content = readFileSync(INDICATORS_FILE, 'utf-8');
    // Extraire les données JSON du fichier TypeScript
    const match = content.match(/export const indicators = (\[[\s\S]*?\]);/);
    if (match) {
      // Évaluer de manière sécurisée le contenu JSON
      return eval('(' + match[1] + ')');
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la lecture des indicateurs:', error);
    return [];
  }
}

// Fonction utilitaire pour écrire les indicateurs dans le fichier
function writeIndicators(indicators) {
  const content = `export const indicators = ${JSON.stringify(indicators, null, 2)};`;
  
  writeFileSync(INDICATORS_FILE, content, 'utf-8');
}

// GET: Récupérer tous les indicateurs
export async function GET() {
  try {
    const indicators = readIndicators();
    return json(indicators);
  } catch (error) {
    return json({ error: 'Erreur lors de la lecture des indicateurs' }, { status: 500 });
  }
}

// POST: Créer un nouvel indicateur
export async function POST({ request }) {
  try {
    const newIndicator = await request.json();
    
    // Validation basique
    if (!newIndicator.id || !newIndicator.title || !newIndicator.axisX || !newIndicator.axisY || !newIndicator.axisZ) {
      return json({ error: 'Données incomplètes' }, { status: 400 });
    }

    const indicators = readIndicators();
    
    // Vérifier que l'ID n'existe pas déjà
    if (indicators.find(i => i.id === newIndicator.id)) {
      return json({ error: 'Un indicateur avec cet ID existe déjà' }, { status: 400 });
    }

    indicators.push(newIndicator);
    writeIndicators(indicators);
    
    return json({ success: true, indicator: newIndicator });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return json({ error: 'Erreur lors de la création de l\'indicateur' }, { status: 500 });
  }
}

// PUT: Mettre à jour un indicateur existant
export async function PUT({ request }) {
  try {
    const updatedIndicator = await request.json();
    
    if (!updatedIndicator.id) {
      return json({ error: 'ID manquant' }, { status: 400 });
    }

    const indicators = readIndicators();
    const index = indicators.findIndex(i => i.id === updatedIndicator.id);
    
    if (index === -1) {
      return json({ error: 'Indicateur introuvable' }, { status: 404 });
    }

    indicators[index] = updatedIndicator;
    writeIndicators(indicators);
    
    return json({ success: true, indicator: updatedIndicator });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return json({ error: 'Erreur lors de la mise à jour de l\'indicateur' }, { status: 500 });
  }
}

// DELETE: Supprimer un indicateur
export async function DELETE({ request }) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return json({ error: 'ID manquant' }, { status: 400 });
    }

    const indicators = readIndicators();
    const filteredIndicators = indicators.filter(i => i.id !== id);
    
    if (filteredIndicators.length === indicators.length) {
      return json({ error: 'Indicateur introuvable' }, { status: 404 });
    }

    writeIndicators(filteredIndicators);
    
    return json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return json({ error: 'Erreur lors de la suppression de l\'indicateur' }, { status: 500 });
  }
}
