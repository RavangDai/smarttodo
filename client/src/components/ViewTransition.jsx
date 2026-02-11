// In App.jsx, wrap content sections with:
/*
<AnimatePresence mode="wait">
  <motion.section
    key={activeView}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
    className="..."
  >
    {content}
  </motion.section>
</AnimatePresence>
*/
