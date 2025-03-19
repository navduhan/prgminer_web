import { motion } from "framer-motion";
import SectionContainer from "./SectionContainer";
import FAQItem from "./FAQItem";

const FAQSection = () => {
  const faqs = [
    {
      question: "What is PRGminer?",
      answer:
        "PRGminer is an advanced bioinformatics tool designed for predicting plant resistance genes (R-genes). By using cutting-edge machine learning algorithms, PRGminer identifies and classifies potential R-genes across a wide variety of plant species, helping researchers enhance crop resistance.",
    },
    {
      question: "How do I submit my plant gene sequences for analysis?",
      answer:
        "You can submit your gene sequences in two ways: 1) Upload a FASTA file containing your sequences, or 2) Paste the FASTA sequences directly into the provided text area. Make sure that each sequence header starts with a '>' symbol, followed by the sequence identifier.",
    },
    {
      question: "What types of file formats does PRGminer support?",
      answer:
        "PRGminer supports FASTA format files (.fasta, .fa, or .txt). Ensure that each sequence is properly formatted with headers beginning with '>' and followed by the sequence identifier. The sequence data should follow on the subsequent lines.",
    },
    {
      question: "How long will the analysis take?",
      answer:
        "The time required for analysis depends on the number of sequences and their lengths. For small datasets (less than 100 sequences), results are typically ready in a few minutes. Larger datasets may require more processing time.",
    },
    {
      question: "What do the confidence scores mean?",
      answer:
        "Confidence scores range from 0 to 1, representing the model's certainty in its predictions. For Phase 1, scores above 0.5 suggest that the sequence is a likely candidate for an R-gene. For Phase 2, the highest score among the predicted R-gene families indicates the most probable classification.",
    },
    {
      question: "Can I download the analysis results?",
      answer:
        "Yes, you can download your results in multiple formats including CSV, JSON, and FASTA. You can choose to download all results or filter by specific R-gene families. Each download will include sequence identifiers, classifications, and confidence scores.",
    },
    {
      question: "Is there a limit on the number of sequences I can submit?",
      answer:
        "Yes, PRGminer has a submission limit of 10,000 sequences per batch to maintain optimal system performance. If you have more than 10,000 sequences, please  either break them into smaller batches and submit them separately or use the standalone version of PRGminer.",
    },
    {
      question: "What is the advantage of using PRGminer for R-gene prediction?",
      answer:
        "PRGminer leverages a powerful two-phase prediction model to identify and classify plant resistance genes accurately. It is designed for high-throughput analysis of plant genetic data, making it an invaluable tool for researchers aiming to study plant-pathogen interactions and enhance agricultural resilience.",
    },
  ];

  return (
    <SectionContainer title="Frequently Asked Questions">
      <motion.div
        className="divide-y divide-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </motion.div>
    </SectionContainer>
  );
};

export default FAQSection;