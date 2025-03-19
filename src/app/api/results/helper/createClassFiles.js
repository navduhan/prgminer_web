// Create Class Files

// Author: Naveen Duhan

// import dependencies

import fs from 'fs/promises';
import path from 'path';

// Helper function to create class-wise FASTA files
export async function createClassFiles(results, namer, tmpDir) {
    if (!results || !results.length) return [];
    
    // Create classes directory in intermediate_files
    const classesDir = path.join(process.cwd(), tmpDir, namer, 'intermediate_files', 'classes');
    await fs.mkdir(classesDir, { recursive: true });
  
    // Get unique classifications - handle both Phase1 and Phase2 formats
    let classifications;
    // Check if this is Phase1 format (only Rgene/Non-Rgene)
    const isPhase1 = results[0].confidence && Object.keys(results[0].confidence).length === 2 
                     && ('Rgene' in results[0].confidence || 'Non-Rgene' in results[0].confidence);

    if (isPhase1) {
        // For Phase1, we create two classes: Rgene and Non-Rgene
        classifications = ['RGene', 'Non-RGene'];
        // Update the classification field based on confidence scores
        results = results.map(r => ({
            ...r,
            classification: r.confidence['Rgene'] > r.confidence['Non-Rgene'] ? 'RGene' : 'Non-RGene'
        }));
    } else {
        // For Phase2, use the existing classifications
        classifications = [...new Set(results.map(r => r.classification))];
    }
  
    // Try multiple locations for the FASTA file
    const possibleFastaPaths = [
      path.join(process.cwd(), tmpDir, namer, `${namer}.fasta`),
      path.join(process.cwd(), tmpDir, `${namer}.fasta`),
      path.join(process.cwd(), tmpDir, namer, 'intermediate_files', `${namer}.fasta`),
      path.join(process.cwd(), tmpDir, namer, 'intermediate_files', 'phase2_input.fasta')
    ];

    let fastaContent;
    for (const fastaPath of possibleFastaPaths) {
      try {
        fastaContent = await fs.readFile(fastaPath, 'utf-8');
        break;
      } catch (error) {
        continue;
      }
    }

    if (!fastaContent) {
      console.error('Could not find FASTA file in any location');
      return [];
    }
  
    // Parse FASTA content into a map of id -> sequence
    const sequences = {};
    const fastaEntries = fastaContent.split('>').filter(Boolean);
    
    for (const entry of fastaEntries) {
      const lines = entry.split('\n');
      const header = lines[0].trim();
      const id = header.split(' ')[0];
      const sequence = lines.slice(1).join('\n').trim();
      sequences[id] = { header, sequence };
    }

    // Create class-wise files
    for (const className of classifications) {
      const classSequences = results
        .filter(r => r.classification === className)
        .map(r => {
          const seq = sequences[r.sequenceId];
          if (seq) {
            // Match the case from readResultFile for confidence keys
            const confidenceKey = isPhase1 ? 
              (className === 'RGene' ? 'Rgene' : 'Non-Rgene') : 
              className;
            
            const confidence = r.confidence[confidenceKey]?.toFixed(4) || '0.0000';
            return `>${seq.header}|Rgene-class:${className}|Confidence:${confidence}\n${seq.sequence}`;
          }
          return null;
        })
        .filter(Boolean);
  
      if (classSequences.length > 0) {
        const classPath = path.join(classesDir, `${className}.fasta`);
        await fs.writeFile(classPath, classSequences.join('\n'));
      }
    }
  
    return classifications;
  }
  