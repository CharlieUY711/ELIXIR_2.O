import React from 'react';
import { handoffToChat } from '../services/handoffToChat';

const Catalog = () => {
  return (
    <div onClick={handoffToChat}>
    </div>
  );
};

export default Catalog;

