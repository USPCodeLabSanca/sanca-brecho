import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Image from 'next/image';
import { X } from 'lucide-react';

type previewImage = { key: string; publicURL: string; };

const ItemType = { IMAGE: 'image' as const };

interface DraggableImageProps {
  image: previewImage;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  openViewer: (img: previewImage) => void;
  removeImage: (idx: number) => void;
}

// Componente para a página com formulário para anunciar
// Usa o pacote react-dnd para implementar a imagem drag and drop para ordená-los
export default function DraggableImage({ image, index, moveImage, openViewer, removeImage }: DraggableImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemType.IMAGE,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      // calcular posição do mouse
      const hoverBounding = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBounding.right - hoverBounding.left) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientX = clientOffset.x - hoverBounding.left;

      // só muda quando cruzar meio
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType.IMAGE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative group ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ cursor: 'move' }}
    >
      <Image
        src={image.publicURL}
        alt={`img-${index}`}
        width={1000}
        height={1000}
        onClick={() => openViewer(image)}
        className="object-cover rounded-md border cursor-pointer"
        priority
      />
      <button
        onClick={() => removeImage(index)}
        type="button"
        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
