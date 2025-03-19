// Author: Naveen Duhan


import { NextResponse } from "next/server";
import { testFasta } from "./helper/testFasta";

// fasta check route
export async function POST(request) {
    try {
      const formData = await request.formData();
      const typeSeq = formData.get('typeSeq');
      let sequence = '';
      let proceed = false;
      let errorFasta = 0;
  
      // Handle different input types
      if (typeSeq === 'Acc') {
        proceed = true;
      } else if (typeSeq === 'File') {
        const file = formData.get('sequence');
        sequence = await file.text();
      } else if (typeSeq === 'text') {
        sequence = formData.get('sequence');
      }
  
      // Validate FASTA if not accession
      if (typeSeq !== 'Acc') {
        const { checkPass, numberSeq } = testFasta(sequence);
        
        if (checkPass) {
          if (numberSeq > 10000) {
            errorFasta = 6; // Too many sequences
          } else {
            proceed = true;
          }
        } else {
          errorFasta = 1; // Invalid FASTA format
        }
      }
  
      if (proceed) {
        return NextResponse.json({ status: 'proceed' });
      } else {
        return NextResponse.json({ status: 'fastaerror', code: errorFasta });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
  } 