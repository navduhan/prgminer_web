// Layout component

// Author: Naveen Duhan

// import dependencies

import {Montserrat} from "next/font/google";


import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/Footer/Footer";

// import styles
import "@/styles/globals.css";

// font settings
const montserrat = Montserrat({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-montserrat",
});

// metadata
export const metadata = {
    title: "PRGminer",
    description: "PRGminer is a Machine Learning based tool for predicting Plant Resistance Genes (R genes)",
    keywords: ["PRGminer", "R genes", "Plant Resistance Genes", "Machine Learning", "Genome Sequencing", "Protein"],
    authors: [{name: "Naveen Duhan", url: "https://github.com/navduhan"}],
    authors: [{name: "Kaundal Artificial Intelligence and Advanced Bioinformatics Lab", url: "https://kaabil.net"}],
    icons: {
        icon: "/favicon.ico",
    }
};

// root layout
const RootLayout = ({children}) => {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} font-sans`}>
             
                    <NavBar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
            
            </body>
        </html>
    );
};

export default RootLayout;