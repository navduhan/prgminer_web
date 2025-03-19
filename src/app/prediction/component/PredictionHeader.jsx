// Prediction Header

// Author: Naveen Duhan

// import dependencies

import {motion} from "framer-motion";

// prediction header component
const PredictionHeader = () => {
    return (
        <motion.div
        className="text-center space-y-4 mb-12"
        initial={{opacity: 0, y: 100}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5, ease: "easeOut"}}
        >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Plant Resistance Gene Prediction
            </h1>
            <p className="text-gray-600 text-md md:text-lg lg:text-xl max-w-3xl mx-auto">  
            Analyze and predict plant resistance genes with our advanced machine learning model
            </p>
     
        </motion.div>
    )
}   

export default PredictionHeader;