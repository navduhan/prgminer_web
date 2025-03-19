// Author: Naveen Duhan

// run task route

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

// Function to check if edirect utilities are installed
async function checkEdirectUtilities() {
  try {
    await execAsync('which esearch');
    return true;
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const namer = formData.get('namer');
    const typeSeq = formData.get('typeSeq');
    const level = formData.get('level');
    const db = formData.get('db');

    // Create temporary directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(tmpDir, { recursive: true });

    // Define file paths
    const fastaFile = path.join(tmpDir, `${namer}.fasta`);
    
    // Handle different input types
    if (typeSeq === 'Acc') {
      if (db === 'ncbi') {
        // Check if edirect utilities are installed
        const hasEdirect = await checkEdirectUtilities();
        if (!hasEdirect) {
          return NextResponse.json(
            { 
              status: 'error', 
              message: 'NCBI sequence retrieval is not available. Please contact system administrator.',
              error: 'EDIRECT_NOT_FOUND'
            },
            { status: 500 }
          );
        }

        const accnNo = formData.get('sequence');
        try {
          // Fetch from NCBI
          await execAsync(`esearch -db nucleotide -query "${accnNo}" | efetch -format fasta > ${fastaFile}`);
          console.log('Successfully fetched and saved NCBI sequence');
        } catch (error) {
          console.error('Error fetching NCBI sequence:', error);
          return NextResponse.json(
            { 
              status: 'error', 
              message: 'Failed to fetch sequence from NCBI. Please verify the accession number.',
              error: 'NCBI_FETCH_FAILED'
            },
            { status: 400 }
          );
        }
      } else if (db === 'uniprot') {
        const accnNo = formData.get('sequence');
        try {
          // Fetch from UniProt
          const response = await fetch(`https://rest.uniprot.org/uniprotkb/${accnNo}.fasta`);
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error(`Sequence not found for accession number: ${accnNo}`);
            }
            throw new Error(`UniProt API error: ${response.statusText}`);
          }
          
          const fastaContent = await response.text();
          
          // Validate FASTA content
          if (!fastaContent || !fastaContent.startsWith('>') || fastaContent.trim().length < 2) {
            throw new Error('Invalid FASTA format received from UniProt');
          }
          
          await fs.writeFile(fastaFile, fastaContent);
          console.log('Successfully fetched and saved UniProt sequence');
        } catch (error) {
          console.error('Error fetching UniProt sequence:', error);
          return NextResponse.json(
            { 
              status: 'error', 
              message: error.message || 'Failed to fetch sequence from UniProt. Please verify the accession number.',
              error: 'UNIPROT_FETCH_FAILED'
            },
            { status: 400 }
          );
        }
      }
    } else if (typeSeq === 'File') {
      const file = formData.get('sequence');
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(fastaFile, buffer);
    } else if (typeSeq === 'text') {
      const sequence = formData.get('sequence');
      await fs.writeFile(fastaFile, sequence);
    }

    // Run the prediction program
    const programPath = 'PRGminer';
    const outputDir = path.join(tmpDir, namer);
    
    try {
      console.log(`${programPath} -i ${fastaFile} -l ${level} -od ${outputDir}`);
      await execAsync(`${programPath} -i ${fastaFile} -l ${level} -od ${outputDir}`);
    } catch (error) {
      console.error('Error running prediction:', error);
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Prediction failed. Please contact support for assistance.',
          error: 'PREDICTION_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      namer: `${namer}+${level}`
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'An unexpected error occurred. Please try again later.',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
} 