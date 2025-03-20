// Layout component

// Author: Naveen Duhan

// import dependencies

import {Montserrat} from "next/font/google";

import NavBar from "@/components/NavBar/NavBar";
import Footer from "@/components/Footer/Footer";
import RedirectHandler from "@/components/utility/RedirectHandler";

// import styles
import "@/styles/globals.css";

// font settings
const montserrat = Montserrat({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-montserrat",
});

// Get basePath for use in metadata
const basePath = process.env.NODE_ENV === "production" ? "/prgminer" : "";

// metadata
export const metadata = {
    title: "PRGminer",
    description: "PRGminer is a Machine Learning based tool for predicting Plant Resistance Genes (R genes)",
    link: [
        { rel: "author", href: "https://kaabil.net" },
        { rel: "icon", href: `${basePath}/favicon.ico` }
    ],
    authors: [{name: "Naveen Duhan", url: "https://github.com/navduhan"}],
    authors: [{name: "Kaundal Artificial Intelligence and Advanced Bioinformatics Lab", url: "https://kaabil.net"}],
    keywords: ["PRGminer", "R genes", "Plant Resistance Genes", "Machine Learning", "Genome Sequencing", "Protein"],
};

// root layout
const RootLayout = ({children}) => {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} font-sans`}>
                <RedirectHandler />
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