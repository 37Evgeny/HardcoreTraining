
import React, { useState } from 'react';

const SafetyCheck = ({ onAccept }) => {
  const [checked, setChecked] = useState({
    warmup: false,
    grip: false,
    posture: false,
    space: false
  });

  const handleChange = (e) => {
    setChecked({ ...checked, [e.target.name]: e.target.checked });
  };

  const allChecked = Object.values(checked).every(Boolean);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 style={{ color: 'var(--primary)' }}>⚠️ Protocol Безопасности</h2>
        <p>Работа с гирей — это высокоинтенсивная нагрузка. Пожалуйста, подтвердите:</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
          <label><input type="checkbox" name="warmup" checked={checked.warmup} onChange={handleChange} /> Я сделал разминку суставов</label>
          <label><input type="checkbox" name="grip" checked={checked.grip} onChange={handleChange} /> Я проверил хват гири</label>
          <label><input type="checkbox" name="posture" checked={checked.posture} onChange={handleChange} /> Я знаю технику нейтрального положения позвоночника</label>
          <label><input type="checkbox" name="space" checked={checked.space} onChange={handleChange} /> Вокруг меня безопасно (радиус 2 метра)</label>
        </div>

        <button 
          className="btn btn-primary" 
          disabled={!allChecked}
          onClick={onAccept}
          style={{ width: '100%', opacity: allChecked ? 1 : 0.5 }}
        >
          Начать тренировку
        </button>
      </div>
    </div>
  );
};

export default SafetyCheck;
