import { useState } from 'react';
import ReservaForm from '../components/ReservaForm';
import ReservaList from '../components/ReservaList';

function Reservas() {
  const [reload, setReload] = useState(false);

  const handleReservaCreada = () => {
    // Cambia el estado para refrescar la lista de reservas
    setReload(!reload);
  };

  return (
    <div>
      <h1>Reservas</h1>
      <ReservaForm onReservaCreada={handleReservaCreada} />
      {/* Se usa la propiedad key para forzar la recarga del componente */}
      <ReservaList key={reload} />
    </div>
  );
}

export default Reservas;
