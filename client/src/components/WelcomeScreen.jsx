import { motion } from "framer-motion";

export default function WelcomeScreen({ onSuggestionClick }) {
  const suggestions = [
    { title: "Plan free deployment", desc: "for fullstack app" },
    { title: "Learn formulas", desc: "for sales data analysis" },
    { title: "Add payment", desc: "integration for demos" },
    { title: "Understand", desc: "TypeScript OOP basics" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col items-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100"
      >
        Ready when you are.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400"
      >
        Pick a suggestion or type your own message. You can also attach a file for
        context.
      </motion.p>

      <div className="mt-10 w-full">
        <div className="mb-3 text-left text-sm text-zinc-400">
          Try something new
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              variants={item}
              onClick={() => onSuggestionClick(`${s.title} ${s.desc}`)}
              className="rounded-2xl border border-white/10 bg-zinc-900/30 p-4 text-left hover:bg-zinc-900/50 transition"
            >
              <div className="font-medium text-zinc-100">{s.title}</div>
              <div className="text-sm text-zinc-400">{s.desc}</div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}