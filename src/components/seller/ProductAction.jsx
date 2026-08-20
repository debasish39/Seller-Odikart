import { Link } from "react-router-dom";
import {
  Eye,
  Edit3,
  Warehouse,
  Send,
  Trash2,
} from "lucide-react";

function ProductActions({
  product,
  onDelete,
  onSubmit,
}) {
  const canSubmit =
    product.status === "draft" ||
    product.status === "rejected";

  return (
    <div className="space-y-2">

      {/* Main actions */}
      <div className="grid grid-cols-3 gap-2">

        <Link
          to={`/seller/products/${product._id}`}
          className="
            group
            flex items-center
            justify-center
            gap-1.5
            rounded-xl
            border border-zinc-200
            bg-white
            px-2
            py-2.5
            text-[11px]
            font-semibold
            text-zinc-600
            transition-all
            duration-200
            hover:border-zinc-300
            hover:bg-zinc-50
            hover:text-black
            active:scale-[0.98]
          "
        >
          <Eye
            size={14}
            className="transition-transform group-hover:scale-110"
          />

          View
        </Link>

        <Link
          to={`/seller/products/${product._id}/edit`}
          className="
            group
            flex items-center
            justify-center
            gap-1.5
            rounded-xl
            bg-black
            px-2
            py-2.5
            text-[11px]
            font-semibold
            text-white
            shadow-sm
            transition-all
            duration-200
            hover:bg-zinc-800
            active:scale-[0.98]
          "
        >
          <Edit3
            size={14}
            className="transition-transform group-hover:scale-110"
          />

          Edit
        </Link>

        <Link
          to={`/seller/products/${product._id}/stock`}
          className="
            group
            flex items-center
            justify-center
            gap-1.5
            rounded-xl
            border border-zinc-200
            bg-white
            px-2
            py-2.5
            text-[11px]
            font-semibold
            text-zinc-600
            transition-all
            duration-200
            hover:border-zinc-300
            hover:bg-zinc-50
            hover:text-black
            active:scale-[0.98]
          "
        >
          <Warehouse
            size={14}
            className="transition-transform group-hover:scale-110"
          />

          Stock
        </Link>
      </div>

      {/* Submit */}
      {canSubmit && (
        <button
          type="button"
          onClick={() =>
            onSubmit(product._id)
          }
          className="
            group
            flex w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border border-zinc-200
            bg-zinc-50
            px-3
            py-2.5
            text-[11px]
            font-bold
            text-zinc-800
            transition-all
            duration-200
            hover:bg-black
            hover:text-white
            active:scale-[0.98]
          "
        >
          <Send
            size={14}
            className="transition-transform group-hover:-translate-y-0.5"
          />

          Submit for Approval
        </button>
      )}

      {/* Delete */}
      <button
        type="button"
        onClick={() =>
          onDelete(product._id)
        }
        className="
          group
          flex w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          px-3
          py-2
          text-[10px]
          font-semibold
          text-zinc-400
          transition-all
          duration-200
          hover:bg-red-50
          hover:text-red-600
          active:scale-[0.98]
        "
      >
        <Trash2
          size={13}
          className="transition-transform group-hover:scale-110"
        />

        Delete Product
      </button>
    </div>
  );
}

export default ProductActions;