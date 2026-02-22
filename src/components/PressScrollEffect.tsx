import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PressArticle } from "@/services/pressService";

interface PressScrollEffectProps {
  articles: PressArticle[];
}

const PressScrollEffect: React.FC<PressScrollEffectProps> = ({ articles }) => {
  if (articles.length === 0) return null;

  const article = articles[0] as PressArticle;

  return (
    <>
      {/* Step 1 - Full image with scale 1.2 */}
      <section className="relative h-screen bg-black">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.img
            src={article.images.main}
            alt={article.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            whileInView={{ scale: 1.2 }}
            viewport={{ amount: 0.5 }}
          />
        </div>
      </section>

      {/* Step 2 - Image scales to 1.1, story appears */}
      <section className="relative h-screen bg-black">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.img
            src={article.images.main}
            alt={article.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            whileInView={{ scale: 1.1 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 1 }}
          />

          {/* Story overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-center"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="max-w-[600px] px-8 text-white"
              initial={{ scale: 2 }}
              whileInView={{ scale: 1 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-[#A68E4E]">
                {article.title}
              </h2>
              <p className="text-lg text-white/80">{article.excerpt}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Step 3 - Image scales to 1, story scales to 0.5, actor info appears */}
      <section className="relative h-screen bg-black">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.img
            src={article.images.main}
            alt={article.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 1 }}
          />

          {/* Story overlay (scaled down) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-center"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 0 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="max-w-[600px] px-8 text-white"
              initial={{ scale: 1 }}
              whileInView={{ scale: 0.5 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl font-bold mb-4 text-[#A68E4E]">
                {article.title}
              </h2>
              <p className="text-lg text-white/80">{article.excerpt}</p>
            </motion.div>
          </motion.div>

          {/* Actor/Details overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-center"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.ul
              className="inline-block text-left text-white"
              initial={{ scale: 2 }}
              whileInView={{ scale: 1 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 1 }}
            >
              <li className="inline-block align-top mr-10">
                <h2 className="text-2xl font-bold mb-2 text-[#A68E4E]">
                  Publikacja
                </h2>
                <h4 className="text-lg flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  {article.publication}
                </h4>
              </li>
              <li className="inline-block align-top mr-10">
                <h2 className="text-2xl font-bold mb-2 text-[#A68E4E]">Data</h2>
                <h4 className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {new Date(article.date).toLocaleDateString("pl-PL")}
                </h4>
              </li>
              <li className="inline-block align-top">
                <h2 className="text-2xl font-bold mb-2 text-[#A68E4E]">
                  Akcja
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gold/30 text-gold-light hover:bg-gold hover:text-black hover:border-gold transition-all duration-300"
                  asChild
                >
                  <Link to={`/press/${article.id}`}>
                    Czytaj więcej
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </li>
            </motion.ul>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default PressScrollEffect;
