import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, setPage }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className={`btn btn-square btn-sm bg-slate-500/10 ${page === 1 ? "bg-transparent" : "bg-slate-500/10"} rounded-lg text-slate-500 border-slate-500/20 hover:bg-slate-500/20`}
      >
        <ChevronLeft size={18} />
      </button>
      {/* =============== */}
      <p className="text-slate-500 text-sm">
        {page} of {totalPages}
      </p>
      {/* =============== */}
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className={`btn btn-square btn-sm ${page === totalPages ? "bg-transparent" : "bg-slate-500/10"} rounded-lg text-slate-500 border-slate-500/20 hover:bg-slate-500/20`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
