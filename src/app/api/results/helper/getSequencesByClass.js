// Get Sequences by Class

// Author: Naveen Duhan

// import dependencies

import fs from 'fs/promises';
import path from 'path';

// Helper function to get sequences by class
export async function getSequencesByClass(namer, className) {
    const tmpDir = process.env.UPLOAD_DIR || 'tmp';
    
    // Special case for all-rgenes
    if (className.toLowerCase() === 'all-rgenes') {
      const classesDir = path.join(process.cwd(), tmpDir, namer, 'intermediate_files', 'classes');
      try {
        const files = await fs.readdir(classesDir);
        let allRGenes = '';
        
        // Read all class files except Non-RGene
        for (const file of files) {
          if (!file.toLowerCase().includes('non-rgene')) {
            const filePath = path.join(classesDir, file);
            const sequences = await fs.readFile(filePath, 'utf-8');
            allRGenes += sequences + '\n';
          }
        }
        
        return allRGenes.trim();
      } catch (error) {
        console.error('Error reading all R-gene sequences:', error);
        return null;
      }
    }
    
    // Regular class-specific case
    const classesDir = path.join(process.cwd(), tmpDir, namer, 'intermediate_files', 'classes');
    try {
      // Get list of all class files
      const files = await fs.readdir(classesDir);
      console.log('Available class files:', files);
      
      // Find the matching file ignoring case
      const matchingFile = files.find(file => 
        file.toLowerCase().replace('.fasta', '') === className.toLowerCase()
      );
      
      if (!matchingFile) {
        console.log(`No matching class file found for ${className}. Available classes:`, 
          files.map(f => f.replace('.fasta', '')));
        return null;
      }
      
      const classPath = path.join(classesDir, matchingFile);
      console.log('Reading sequences from:', classPath);
      const sequences = await fs.readFile(classPath, 'utf-8');
      return sequences;
    } catch (error) {
      console.error(`Error reading sequences for class ${className}:`, error);
      return null;
    }
  }