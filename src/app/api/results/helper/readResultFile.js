// Author: Naveen Duhan

// Helper function to read and parse TSV result file
import fs from 'fs/promises';
import path from 'path';

export async function readResultFile(filePath, namer, tmpDir) {
    try {
      console.log('Reading file from path:', filePath);
      const data = await fs.readFile(filePath, 'utf-8');
      const lines = data.trim().split('\n');
      const headers = lines[0].split('\t');
      
      // Check if this is Phase1 or Phase2 format
      const isPhase1 = headers.includes('Non-Rgene') && headers.includes('Rgene');
      console.log('File format:', isPhase1 ? 'Phase1' : 'Phase2', 'with headers:', headers);
    
      const confidenceColumns = isPhase1 ? ['Non-Rgene', 'Rgene'] : headers.slice(2);
      console.log('Confidence columns:', confidenceColumns);
  
      // Ensure tmp directory exists
      const tmpPath = path.join(process.cwd(), tmpDir);
      try {
        await fs.access(tmpPath);
      } catch {
        await fs.mkdir(tmpPath, { recursive: true });
      }
  
      // Create a persistent directory for this result
      const persistentDir = path.join(process.cwd(), tmpDir, namer);
      try {
        await fs.access(persistentDir);
      } catch {
        await fs.mkdir(persistentDir, { recursive: true });
      }
  
      // Try multiple locations for the FASTA file
      const possibleFastaPaths = [
        path.join(process.cwd(), tmpDir, `${namer}.fasta`),
        path.join(persistentDir, `${namer}.fasta`),
        path.join(process.cwd(), tmpDir, namer, 'intermediate_files', `${namer}.fasta`)
      ];
  
      let sequences = {};
      let fastaContent = null;
  
      // Try each possible location
      for (const fastaPath of possibleFastaPaths) {
        try {
          console.log('Trying to read FASTA from:', fastaPath);
          fastaContent = await fs.readFile(fastaPath, 'utf-8');
          
          // If found, copy to persistent location if not already there
          const persistentFastaPath = path.join(persistentDir, `${namer}.fasta`);
          if (fastaPath !== persistentFastaPath) {
            await fs.writeFile(persistentFastaPath, fastaContent);
            console.log('Copied FASTA file to persistent location:', persistentFastaPath);
          }
          
          break; // Exit loop if file is found
        } catch (error) {
          console.log('FASTA not found at:', fastaPath);
        }
      }
  
      if (fastaContent) {
        const fastaEntries = fastaContent.split('>').filter(Boolean);
        for (const entry of fastaEntries) {
          const lines = entry.split('\n');
          const id = lines[0].split(' ')[0].trim();
          const sequence = lines.slice(1).join('');
          sequences[id] = sequence.trim();
        }
        console.log('Loaded sequences from FASTA file');
      } else {
        console.log('No FASTA file found in any location');
      }
      
      const results = lines.slice(1).map(line => {
        const values = line.split('\t');
        const confidences = {};
        
        if (isPhase1) {
          // For Phase1, map Non-Rgene and Rgene columns
          confidences['Non-Rgene'] = parseFloat(values[2] || 0);
          confidences['Rgene'] = parseFloat(values[3] || 0);
          
          // Determine classification based on confidence scores
          const classification = confidences['Rgene'] > confidences['Non-Rgene'] ? 'RGene' : 'Non-RGene';
          
          return {
            sequenceId: values[0],
            classification,
            confidence: confidences,
            sequence: sequences[values[0]] || ''
          };
        } else {
          // For Phase2, map each confidence column to its value
          confidenceColumns.forEach((className, index) => {
            confidences[className] = parseFloat(values[index + 2] || 0);
          });
          
          return {
            sequenceId: values[0],
            classification: values[1],
            confidence: confidences,
            sequence: sequences[values[0]] || ''
          };
        }
      });
  
      console.log(`Processed ${results.length} results from ${isPhase1 ? 'Phase1' : 'Phase2'} file`);
      console.log('Sample result:', results[0]);
      return results;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  }