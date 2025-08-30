// Ecuador-specific validation utilities

export const validateEcuadorianPhone = (phone: string): boolean => {
  // Ecuador phone format: +593 9XX-XXX-XXX (mobile)
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it starts with 593 (country code) and has 9 digits after
  if (cleaned.startsWith('593')) {
    const withoutCountryCode = cleaned.substring(3);
    return withoutCountryCode.length === 9 && withoutCountryCode.startsWith('9');
  }
  
  // Check if it's a local format (9XX-XXX-XXX)
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return true;
  }
  
  return false;
};

export const formatEcuadorianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('593')) {
    const local = cleaned.substring(3);
    return `+593 ${local.substring(0, 1)}-${local.substring(1, 3)}-${local.substring(3, 6)}-${local.substring(6)}`;
  }
  
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  return phone;
};

export const validateWalletAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

export const validateAmount = (amount: string): { isValid: boolean; error?: string } => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Por favor ingresa un monto válido' };
  }
  
  if (numAmount < 10) {
    return { isValid: false, error: 'El monto mínimo es $10 USD' };
  }
  
  if (numAmount > 10000) {
    return { isValid: false, error: 'El monto máximo es $10,000 USD' };
  }
  
  return { isValid: true };
};

export const calculateFees = (amount: number) => {
  const feeRate = 0.005; // 0.5%
  const fee = amount * feeRate;
  const total = amount + fee;
  
  return {
    amount,
    fee: Math.round(fee * 100) / 100,
    total: Math.round(total * 100) / 100,
    recipient: amount
  };
};

// Ecuador provinces for address validation
export const ecuadorProvinces = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
  'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
  'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
  'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos',
  'Tungurahua', 'Zamora Chinchipe'
];
