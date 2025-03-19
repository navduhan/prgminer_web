import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

import { readResultFile } from '../helper/readResultFile';
import { createClassFiles } from '../helper/createClassFiles';
import { getSequencesByClass } from '../helper/getSequencesByClass';
import { getSequenceById } from '../helper/getSequenceById';

export async function GET(request, context) {
  try {
    const { id: resultId } = context.params;
    const decodedId = decodeURIComponent(resultId);
    const parts = decodedId.split(/[\s_]+/);
    const namer = parts[0];
    const tmpDir = process.env.UPLOAD_DIR || 'tmp';

    // Ensure intermediate_files directory exists
    const intermediateDir = path.join(process.cwd(), tmpDir, namer, 'intermediate_files');
    try {
      await fs.access(intermediateDir);
    } catch {
      await fs.mkdir(intermediateDir, { recursive: true });
    }

    // Define file paths
    const phase1Path = path.join(intermediateDir, 'Phase1_predictions.tsv');
    const phase2Path = path.join(intermediateDir, 'Phase2_predictions.tsv');

    // Read Phase 1 results
    const phase1Results = await readResultFile(phase1Path, namer, tmpDir);

    // Read Phase 2 results if available
    let phase2Results = null;
    let phase2Available = false;
    try {
      await fs.stat(phase2Path);
      phase2Results = await readResultFile(phase2Path, namer, tmpDir);
      phase2Available = phase2Results && phase2Results.length > 0;
    } catch (error) {
      // Phase 2 results not available
    }

    // Handle query parameters
    const searchParams = request.nextUrl.searchParams;
    const seqId = searchParams.get('seqId');
    const className = searchParams.get('class');

    // Determine phase level based on the requested class
    let level;
    if (className) {
      // If requesting RGene or Non-RGene, use Phase1
      if (className.toLowerCase() === 'rgene' || className.toLowerCase() === 'non-rgene') {
        level = 'Phase1';
      } else if (phase2Available) {
        // For other classes, use Phase2 if available
        level = 'Phase2';
      } else {
        level = 'Phase1';
      }
    } else {
      // For non-class requests, prefer Phase2 if available unless Phase1 is explicitly requested
      level = decodedId.includes('Phase1') ? 'Phase1' : 
              (phase2Available ? 'Phase2' : 'Phase1');
    }

    // Create class files
    let availableClasses = [];
    try {
      if (level === 'Phase1' && phase1Results) {
        availableClasses = await createClassFiles(phase1Results, namer, tmpDir);
      } else if (level === 'Phase2' && phase2Results) {
        availableClasses = await createClassFiles(phase2Results, namer, tmpDir);
      }
    } catch (error) {
      console.error('Error creating class files:', error);
    }

    if (seqId) {
      const sequence = await getSequenceById(namer, seqId);
      if (sequence) {
        return NextResponse.json({ sequence });
      }
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    if (className) {
      const sequences = await getSequencesByClass(namer, className);
      if (sequences) {
        return NextResponse.json({ sequences });
      }
      return NextResponse.json({ error: 'Class sequences not found' }, { status: 404 });
    }

    // Return response
    return NextResponse.json({
      phase1: phase1Results,
      phase2: phase2Results,
      availableClasses,
      selectedPhase: level,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}