import { useNavigate } from 'react-router-dom';

export default function Button({ children, to, className = '', onClick, ...props }) {
  const navigate = useNavigate();

  // Clases base: Color esmeralda, texto negro, sombra difuminada y efectos hover
  const baseClasses = "!bg-emerald-500 !text-black px-6 py-2 rounded-lg font-medium hover:!bg-emerald-600 hover:!text-white transition-all shadow-lg shadow-emerald-400/50 flex items-center justify-center";

  const handleClick = (e) => {
    // Si pasaste una función onClick (ej. para analytics o validación), se ejecuta primero
    if (onClick) onClick(e);
    
    // Si pasaste una ruta en 'to', navega automáticamente
    if (to) navigate(to);
  };

  return (
    <button 
      className={`${baseClasses} ${className}`} 
      onClick={handleClick} 
      {...props}
    >
      {children}
    </button>
  );
}