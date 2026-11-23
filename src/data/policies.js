/**
 * PLANTILLAS de políticas en español. NO son asesoría legal ni están certificadas.
 * El propietario del negocio debe revisarlas y completar los campos entre [CORCHETES].
 */
export const policies = {
  privacy: {
    title: 'Política de privacidad',
    intro: 'Explica cómo [NOMBRE LEGAL DEL NEGOCIO] recopila y utiliza los datos personales de sus clientes.',
    sections: [
      ['Datos que recopilamos', 'Nombre, número de WhatsApp, correo electrónico (opcional), dirección de entrega (si solicitas entrega a domicilio) e información de tus pedidos. Si creas una cuenta, también tu correo y perfil.'],
      ['Uso de la información', 'Utilizamos tus datos para procesar y confirmar pedidos, coordinar entregas, brindar atención al cliente y mejorar la tienda. No vendemos tus datos personales.'],
      ['Almacenamiento y seguridad', 'Los datos se almacenan en servicios de Google Firebase. Aplicamos controles de acceso para que solo el personal autorizado pueda consultarlos.'],
      ['Tus derechos', 'Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a [CORREO O WHATSAPP DE CONTACTO].'],
      ['Cookies y analítica', 'El sitio puede usar almacenamiento local para tu carrito y, si está configurado, Google Analytics. [REVISAR SEGÚN CONFIGURACIÓN REAL]'],
    ],
  },
  terms: {
    title: 'Términos y condiciones',
    intro: 'Condiciones generales de uso de la tienda y de compra de productos.',
    sections: [
      ['Pedidos por WhatsApp', 'Enviar un pedido desde el sitio no constituye una confirmación de compra. La tienda confirma disponibilidad, precio final, entrega y forma de pago de manera manual por WhatsApp.'],
      ['Precios y disponibilidad', 'Los precios están expresados en pesos dominicanos (RD$) y pueden cambiar sin previo aviso. La disponibilidad está sujeta a confirmación.'],
      ['Pagos', 'Este sitio no procesa pagos en línea. Las formas de pago se acuerdan directamente con la tienda: [FORMAS DE PAGO ACEPTADAS].'],
      ['Responsabilidad', 'Las imágenes son referenciales. [AÑADIR CLÁUSULAS ADICIONALES APROBADAS POR EL NEGOCIO]'],
    ],
  },
  shipping: {
    title: 'Envíos y entregas',
    intro: 'Información sobre retiro en tienda y entrega a domicilio.',
    sections: [
      ['Métodos de entrega', 'Retiro en tienda y entrega a domicilio. [AJUSTAR SEGÚN LO QUE OFREZCA EL NEGOCIO]'],
      ['Costos y tiempos', 'El costo y el tiempo de entrega se confirman por WhatsApp según tu ubicación. [DEFINIR ZONAS, COSTOS Y PLAZOS]'],
      ['Recepción', 'Verifica el producto al momento de recibirlo. Reporta cualquier inconveniente de inmediato a través de WhatsApp.'],
    ],
  },
  returns: {
    title: 'Devoluciones y reembolsos',
    intro: 'Condiciones para solicitar cambios o devoluciones.',
    sections: [
      ['Plazo y condiciones', '[DEFINIR PLAZO, ESTADO DEL PRODUCTO, EMPAQUE Y ACCESORIOS REQUERIDOS]'],
      ['Cómo solicitarlo', 'Escribe a la tienda por WhatsApp con tu número de pedido y el motivo de la solicitud.'],
      ['Reembolsos', '[DEFINIR MÉTODO Y TIEMPOS DE REEMBOLSO]'],
    ],
  },
  warranty: {
    title: 'Política de garantía',
    intro: 'Cobertura aplicable a los productos vendidos por la tienda.',
    sections: [
      ['Cobertura', '[DEFINIR DURACIÓN Y ALCANCE DE LA GARANTÍA POR CATEGORÍA DE PRODUCTO]'],
      ['Exclusiones', '[DEFINIR EXCLUSIONES: DAÑOS POR MAL USO, LÍQUIDOS, GOLPES, ETC.]'],
      ['Cómo reclamar', 'Contacta a la tienda por WhatsApp con tu número de pedido para evaluar tu caso.'],
    ],
  },
};
