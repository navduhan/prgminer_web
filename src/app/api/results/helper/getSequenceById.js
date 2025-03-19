// Get Sequence by ID

// Author: Naveen Duhan

// import dependencies

import fs from 'fs/promises';
import path from 'path';

// Helper function to get sequence by ID
export async function getSequenceById(namer, seqId) {
    const tmpDir = process.env.UPLOAD_DIR || 'tmp';
    
    // Try multiple locations for the FASTA file
    const possibleFastaPaths = [
      path.join(process.cwd(), tmpDir, `${namer}.fasta`),
      path.join(process.cwd(), tmpDir, namer, `${namer}.fasta`),
      path.join(process.cwd(), tmpDir, namer, 'intermediate_files', `${namer}.fasta`)
    ];
  
    for (const fastaPath of possibleFastaPaths) {
      try {
        console.log('Trying to read sequence from:', fastaPath);
        const fastaContent = await fs.readFile(fastaPath, 'utf-8');
        const sequences = fastaContent.split('>').filter(Boolean);
        const sequence = sequences.find(seq => seq.trim().startsWith(seqId));
        if (sequence) {
          const lines = sequence.split('\n');
          const header = lines[0];
          const sequenceData = lines.slice(1).join('');
          return `>${header}\n${sequenceData}`;
        }
      } catch (error) {
        console.log('FASTA not found at:', fastaPath);
      }
    }
    
    console.error(`Sequence ${seqId} not found in any FASTA file`);
    return null;
  }