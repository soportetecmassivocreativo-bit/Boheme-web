import { Order, Product, CATEGORIES } from './db';
import { PdfTemplateSettings } from './settings';
import { getOrderWorkshopType, getWorkshopTypeLabel, getStageInfo, getDefaultWorkshopStatus } from './workshop';

const DEFAULT_PDF_CONFIG: PdfTemplateSettings = {
    nombreEmpresa: 'BOHEME • Indumentaria & Equipos Médicos',
    rifEmpresa: 'V-24.354.847',
    direccionFiscal: 'Municipio Miranda (Coro) y Municipio Colina (La Vela), Estado Falcón, Venezuela',
    telefonoContacto: '0412-1409976',
    emailContacto: 'worldglobalweb724@gmail.com',
    colorPrimario: '#5F2142',
    colorAcento: '#D86A33',
    mostrarLogo: true,
    mostrarTasaBcv: true,
    mostrarFirmas: true,
    mostrarSelloAgua: true,
    encabezadoFactura: 'FACTURA / COMPROBANTE DE COMPRA',
    piePaginaFactura: 'Gracias por tu compra en BOHEME. Entregas locales en Municipio Miranda y Municipio Colina, y envíos nacionales garantizados.',
    encabezadoReporte: 'REPORTE OFICIAL DE GESTIÓN ADMINISTRATIVA',
    piePaginaReporte: 'Documento generado por el Panel Administrativo de BOHEME • Uso Interno y Contable.',
    tamanoPapel: 'letter',
    orientacionReporte: 'portrait'
};

function openPdfWindow(htmlContent: string) {
    const printWin = window.open('', '_blank');
    if (!printWin) {
        alert('Por favor habilita las ventanas emergentes en tu navegador para generar y descargar el PDF.');
        return;
    }
    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
}

function getBaseStyles(cfg: PdfTemplateSettings, isReport = false) {
    const primary = cfg.colorPrimario || '#5F2142';
    const accent = cfg.colorAcento || '#D86A33';
    const pageSize = cfg.tamanoPapel === 'a4' ? 'A4' : 'letter';
    const orientation = isReport ? (cfg.orientacionReporte || 'portrait') : 'portrait';

    return `
        @page {
            size: ${pageSize} ${orientation};
            margin: 14mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 24px;
            font-size: 12px;
            line-height: 1.45;
            background: #ffffff;
            position: relative;
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1f121d;
            color: #fff;
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .toolbar-btn {
            background: ${accent};
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 12px;
            cursor: pointer;
            margin-left: 8px;
        }
        .toolbar-btn.secondary {
            background: rgba(255,255,255,0.15);
        }
        .watermark {
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 86px;
            font-weight: 900;
            color: rgba(95, 33, 66, 0.035);
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
            letter-spacing: 8px;
        }
        .doc-container {
            position: relative;
            z-index: 1;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid ${primary};
            padding-bottom: 16px;
            margin-bottom: 20px;
            gap: 16px;
        }
        .brand-box {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .brand-logo {
            height: 50px;
            width: auto;
            object-fit: contain;
        }
        .company-name {
            font-size: 18px;
            font-weight: 900;
            color: ${primary};
            letter-spacing: -0.3px;
        }
        .company-meta {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
        }
        .doc-title-box {
            text-align: right;
        }
        .doc-badge {
            display: inline-block;
            background: ${primary};
            color: #ffffff;
            font-weight: 900;
            font-size: 11px;
            padding: 4px 12px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }
        .doc-number {
            font-size: 20px;
            font-weight: 900;
            color: ${accent};
            margin-top: 4px;
            font-family: monospace;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }
        .kpi-card {
            border: 1px solid #e5e7eb;
            border-left: 4px solid ${primary};
            border-radius: 10px;
            padding: 10px 14px;
            background: #fdfaf7;
        }
        .kpi-label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #6b7280;
        }
        .kpi-value {
            font-size: 17px;
            font-weight: 900;
            color: ${primary};
            margin-top: 2px;
        }
        .kpi-sub {
            font-size: 10px;
            color: ${accent};
            font-weight: 700;
        }
        .section-box {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 16px;
            background: #ffffff;
        }
        .section-title {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            color: ${primary};
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 6px;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 11px;
        }
        th {
            background: ${primary};
            color: #ffffff;
            text-align: left;
            padding: 8px 10px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }
        tr:nth-child(even) td {
            background: #fcfaf8;
        }
        .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .pill-green { background: #d1fae5; color: #065f46; }
        .pill-amber { background: #fef3c7; color: #92400e; }
        .pill-red { background: #fee2e2; color: #991b1b; }
        .pill-purple { background: #f3e8ff; color: #6b21a8; }
        .totals-box {
            margin-left: auto;
            width: 300px;
            border: 2px solid ${primary};
            border-radius: 10px;
            padding: 12px 16px;
            background: #fff9f5;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 12px;
        }
        .totals-row.final {
            border-top: 1px solid #d1d5db;
            margin-top: 6px;
            padding-top: 8px;
            font-size: 15px;
            font-weight: 900;
            color: ${primary};
        }
        .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 42px;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #4b5563;
        }
        .sig-line {
            width: 210px;
            border-top: 1.5px solid #374151;
            padding-top: 6px;
            font-weight: 700;
        }
        .footer {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px dashed #d1d5db;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
        }
        @media print {
            .toolbar { display: none !important; }
            body { padding: 0; }
        }
    `;
}

// ==========================================
// 1. FACTURA INDIVIDUAL PDF
// ==========================================
export function generateInvoicePdf(order: Order, pdfConfig?: Partial<PdfTemplateSettings>, currentBcvRate = 887.30) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };
    const statusNorm = (order.estado_pago === 'verificada' || order.estado_pago === 'verificado')
        ? { label: 'VERIFICADA / PAGADA', cls: 'pill-green' }
        : (order.estado_pago === 'rechazada' || order.estado_pago === 'rechazado')
            ? { label: 'RECHAZADA', cls: 'pill-red' }
            : { label: 'POR VERIFICAR', cls: 'pill-amber' };

    const bcvUsed = order.tasa_bcv || currentBcvRate;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Factura ${order.numero_factura} - ${cfg.nombreEmpresa}</title>
            <style>${getBaseStyles(cfg, false)}</style>
        </head>
        <body>
            <div class="toolbar">
                <div>
                    <strong>📄 Vista Previa de Factura PDF: ${order.numero_factura}</strong>
                    <span style="font-size: 11px; opacity: 0.8; margin-left: 10px;">Usa "Guardar como PDF" en el destino de impresión</span>
                </div>
                <div>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            ${cfg.mostrarSelloAgua ? `<div class="watermark">BOHEME</div>` : ''}

            <div class="doc-container">
                <div class="header">
                    <div class="brand-box">
                        ${cfg.mostrarLogo ? `<img src="/logo-wine.png" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
                        <div>
                            <div class="company-name">${cfg.nombreEmpresa}</div>
                            <div class="company-meta">RIF / C.I: ${cfg.rifEmpresa} • Tel: ${cfg.telefonoContacto}</div>
                            <div class="company-meta">${cfg.direccionFiscal}</div>
                            ${cfg.emailContacto ? `<div class="company-meta">${cfg.emailContacto}</div>` : ''}
                        </div>
                    </div>
                    <div class="doc-title-box">
                        <div class="doc-badge">${cfg.encabezadoFactura}</div>
                        <div class="doc-number">N° ${order.numero_factura}</div>
                        <div class="company-meta">Fecha: ${new Date(order.created_at).toLocaleString('es-VE')}</div>
                        <div style="margin-top: 4px;"><span class="pill ${statusNorm.cls}">${statusNorm.label}</span></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
                    <div class="section-box" style="margin-bottom: 0;">
                        <div class="section-title">Datos del Cliente</div>
                        <div><strong>Nombre y Apellido:</strong> ${order.cliente_nombre} ${order.cliente_apellido}</div>
                        <div><strong>Cédula / RIF:</strong> ${order.cliente_cedula}</div>
                        <div><strong>Teléfono / WhatsApp:</strong> ${order.cliente_telefono}</div>
                        <div><strong>Modalidad de Entrega:</strong> ${order.tipo_entrega === 'local' ? 'Entrega Local (Mcpio. Miranda / Mcpio. Colina)' : `Envío Nacional (${order.empresa_envio || 'MRW'})`}</div>
                        <div><strong>Dirección / Destino:</strong> ${order.direccion_entrega} ${order.ciudad ? `(${order.ciudad}, ${order.estado || ''})` : ''}</div>
                        ${order.numero_guia_envio ? `<div><strong>N° Guía de Envío:</strong> ${order.numero_guia_envio}</div>` : ''}
                    </div>

                    <div class="section-box" style="margin-bottom: 0;">
                        <div class="section-title">Información de Pago</div>
                        <div><strong>Método de Pago:</strong> ${order.nombre_metodo_pago || (order.metodo_pago === 'pago_movil' ? 'Pago Móvil' : order.metodo_pago === 'binance' ? 'Binance Pay (USDT)' : order.metodo_pago.toUpperCase())}</div>
                        ${order.banco_emisor ? `<div><strong>Banco / Plataforma Origen:</strong> ${order.banco_emisor}</div>` : ''}
                        <div><strong>Cuenta / Emisor:</strong> ${order.telefono_o_email_emisor}</div>
                        <div><strong>N° Referencia / TxID:</strong> <span style="font-family: monospace; font-weight: 900;">${order.referencia_pago}</span></div>
                        ${cfg.mostrarTasaBcv ? `<div><strong>Tasa Oficial BCV Aplicada:</strong> ${bcvUsed} Bs/$</div>` : ''}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 45px;">#</th>
                            <th>Descripción del Producto & Especificaciones</th>
                            <th style="width: 75px; text-align: center;">Cant.</th>
                            <th style="width: 100px; text-align: right;">P. Unit ($ USD)</th>
                            <th style="width: 110px; text-align: right;">Subtotal ($ USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((it, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>
                                    <div style="font-weight: 800; color: #111827;">${it.name}</div>
                                    ${(it.is_personalizado || it.nombre_personalizado || it.especialidad_personalizada || it.color_preferencia || it.detalles_personalizados) ? `
                                        <div style="margin-top: 4px; font-size: 10px; color: #4b5563; background: #fff9f5; padding: 4px 8px; border-left: 2px solid ${cfg.colorAcento}; border-radius: 4px;">
                                            ${it.nombre_personalizado ? `<div><strong>• Nombre / Personalización:</strong> ${it.nombre_personalizado}</div>` : ''}
                                            ${it.especialidad_personalizada ? `<div><strong>• Especialidad:</strong> ${it.especialidad_personalizada}</div>` : ''}
                                            ${it.color_preferencia ? `<div><strong>• Color / Preferencia:</strong> ${it.color_preferencia}</div>` : ''}
                                            ${it.detalles_personalizados ? `<div><strong>• Detalles:</strong> ${it.detalles_personalizados}</div>` : ''}
                                        </div>
                                    ` : ''}
                                </td>
                                <td style="text-align: center; font-weight: 700;">${it.quantity}</td>
                                <td style="text-align: right;">$${Number(it.price).toFixed(2)}</td>
                                <td style="text-align: right; font-weight: 800;">$${(Number(it.price) * Number(it.quantity)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-box">
                    <div class="totals-row">
                        <span>Total en Divisas ($ USD):</span>
                        <strong>$${order.monto_usd.toFixed(2)} USD</strong>
                    </div>
                    ${cfg.mostrarTasaBcv ? `
                        <div class="totals-row">
                            <span>Tasa BCV Aplicada:</span>
                            <span>${bcvUsed} Bs/$</span>
                        </div>
                    ` : ''}
                    <div class="totals-row final">
                        <span>Total en Bolívares:</span>
                        <span>Bs. ${order.monto_bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                ${cfg.mostrarFirmas ? `
                    <div class="signatures">
                        <div class="sig-line">Emitido por Administración ${cfg.nombreEmpresa.split('•')[0]}</div>
                        <div class="sig-line">Recibido Conforme (${order.cliente_nombre} ${order.cliente_apellido})</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div><strong>${cfg.piePaginaFactura}</strong></div>
                    <div style="margin-top: 4px;">Comprobante N° ${order.numero_factura} • Impreso el ${new Date().toLocaleString('es-VE')}</div>
                </div>
            </div>
        </body>
        </html>
    `;

    openPdfWindow(html);
}

// ==========================================
// 2. REPORTE DE FACTURADO (VENTAS E INGRESOS) PDF
// ==========================================
export function generateBillingReportPdf(
    orders: Order[],
    filterSummary: string,
    pdfConfig?: Partial<PdfTemplateSettings>,
    currentBcvRate = 887.30
) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };
    const totalUsd = orders.reduce((acc, o) => acc + o.monto_usd, 0);
    const totalBs = orders.reduce((acc, o) => acc + o.monto_bs, 0);
    const verifiedOrders = orders.filter(o => o.estado_pago === 'verificada' || o.estado_pago === 'verificado');
    const totalVerifiedUsd = verifiedOrders.reduce((acc, o) => acc + o.monto_usd, 0);
    const pmOrders = orders.filter(o => o.metodo_pago === 'pago_movil');
    const binanceOrders = orders.filter(o => o.metodo_pago === 'binance');

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Reporte de Facturado - ${cfg.nombreEmpresa}</title>
            <style>${getBaseStyles(cfg, true)}</style>
        </head>
        <body>
            <div class="toolbar">
                <div>
                    <strong>📊 Reporte de Facturado y Ventas (${orders.length} registros)</strong>
                </div>
                <div>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            ${cfg.mostrarSelloAgua ? `<div class="watermark">BOHEME</div>` : ''}

            <div class="doc-container">
                <div class="header">
                    <div class="brand-box">
                        ${cfg.mostrarLogo ? `<img src="/logo-wine.png" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
                        <div>
                            <div class="company-name">${cfg.nombreEmpresa}</div>
                            <div class="company-meta">RIF: ${cfg.rifEmpresa} • ${cfg.direccionFiscal}</div>
                            <div class="company-meta">Filtro aplicado: <strong>${filterSummary}</strong></div>
                        </div>
                    </div>
                    <div class="doc-title-box">
                        <div class="doc-badge">${cfg.encabezadoReporte}</div>
                        <div class="doc-number" style="font-size: 15px;">REPORTE DE FACTURADO</div>
                        <div class="company-meta">Generado: ${new Date().toLocaleString('es-VE')}</div>
                        ${cfg.mostrarTasaBcv ? `<div class="company-meta">Tasa BCV Ref: <strong>${currentBcvRate} Bs/$</strong></div>` : ''}
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Facturado</div>
                        <div class="kpi-value">$${totalUsd.toFixed(2)} USD</div>
                        <div class="kpi-sub">Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Pagos Verificados</div>
                        <div class="kpi-value">$${totalVerifiedUsd.toFixed(2)} USD</div>
                        <div class="kpi-sub">${verifiedOrders.length} de ${orders.length} facturas</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Pago Móvil / Bs</div>
                        <div class="kpi-value">$${pmOrders.reduce((a, b) => a + b.monto_usd, 0).toFixed(2)}</div>
                        <div class="kpi-sub">${pmOrders.length} operaciones</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Binance / Divisas</div>
                        <div class="kpi-value">$${binanceOrders.reduce((a, b) => a + b.monto_usd, 0).toFixed(2)}</div>
                        <div class="kpi-sub">${binanceOrders.length} operaciones</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>N° Factura</th>
                            <th>Fecha</th>
                            <th>Cliente & Cédula</th>
                            <th>Artículos</th>
                            <th>Método / Ref</th>
                            <th>Estatus</th>
                            <th style="text-align: right;">Monto ($ USD)</th>
                            <th style="text-align: right;">Monto (Bs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => {
                            const st = (o.estado_pago === 'verificada' || o.estado_pago === 'verificado')
                                ? { l: 'Verificada', c: 'pill-green' }
                                : (o.estado_pago === 'rechazada' || o.estado_pago === 'rechazado')
                                    ? { l: 'Rechazada', c: 'pill-red' }
                                    : { l: 'Por Verificar', c: 'pill-amber' };
                            return `
                                <tr>
                                    <td style="font-family: monospace; font-weight: 900; color: ${cfg.colorPrimario};">${o.numero_factura}</td>
                                    <td>${new Date(o.created_at).toLocaleDateString('es-VE')}</td>
                                    <td>
                                        <strong>${o.cliente_nombre} ${o.cliente_apellido}</strong><br/>
                                        <span style="color: #6b7280; font-size: 10px;">${o.cliente_cedula} • ${o.cliente_telefono}</span>
                                    </td>
                                    <td>
                                        ${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </td>
                                    <td>
                                        <strong>${o.nombre_metodo_pago || (o.metodo_pago === 'pago_movil' ? 'Pago Móvil' : o.metodo_pago === 'binance' ? 'Binance' : o.metodo_pago)}</strong><br/>
                                        <span style="font-family: monospace; font-size: 10px;">Ref: ${o.referencia_pago}</span>
                                    </td>
                                    <td><span class="pill ${st.c}">${st.l}</span></td>
                                    <td style="text-align: right; font-weight: 800;">$${o.monto_usd.toFixed(2)}</td>
                                    <td style="text-align: right;">Bs. ${o.monto_bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div class="totals-box">
                    <div class="totals-row">
                        <span>Total Registros:</span>
                        <strong>${orders.length} facturas</strong>
                    </div>
                    <div class="totals-row">
                        <span>Total General ($ USD):</span>
                        <strong>$${totalUsd.toFixed(2)} USD</strong>
                    </div>
                    <div class="totals-row final">
                        <span>Total General (Bs.):</span>
                        <span>Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                ${cfg.mostrarFirmas ? `
                    <div class="signatures">
                        <div class="sig-line">Firma Administración / Finanzas</div>
                        <div class="sig-line">Auditoría / Gerencia General</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div><strong>${cfg.piePaginaReporte}</strong></div>
                </div>
            </div>
        </body>
        </html>
    `;

    openPdfWindow(html);
}

// ==========================================
// 3. REPORTE DE TALLER Y PRODUCCIÓN PDF
// ==========================================
export function generateWorkshopReportPdf(
    orders: Order[],
    filterSummary: string,
    pdfConfig?: Partial<PdfTemplateSettings>
) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };
    const activos = orders.filter(o => !o.pedido_cerrado).length;
    const cerrados = orders.filter(o => o.pedido_cerrado).length;
    const locales = orders.filter(o => o.tipo_entrega === 'local').length;
    const nacionales = orders.filter(o => o.tipo_entrega === 'nacional').length;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Reporte de Taller y Pedidos - ${cfg.nombreEmpresa}</title>
            <style>${getBaseStyles(cfg, true)}</style>
        </head>
        <body>
            <div class="toolbar">
                <div>
                    <strong>✂️ Reporte de Taller, Confección y Despacho (${orders.length} pedidos)</strong>
                </div>
                <div>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            ${cfg.mostrarSelloAgua ? `<div class="watermark">BOHEME TALLER</div>` : ''}

            <div class="doc-container">
                <div class="header">
                    <div class="brand-box">
                        ${cfg.mostrarLogo ? `<img src="/logo-wine.png" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
                        <div>
                            <div class="company-name">${cfg.nombreEmpresa}</div>
                            <div class="company-meta">Control de Producción, Diseño, Imprenta, Costura y Despacho</div>
                            <div class="company-meta">Filtro: <strong>${filterSummary}</strong></div>
                        </div>
                    </div>
                    <div class="doc-title-box">
                        <div class="doc-badge">${cfg.encabezadoReporte}</div>
                        <div class="doc-number" style="font-size: 15px;">REPORTE DE TALLER Y PEDIDOS</div>
                        <div class="company-meta">Fecha: ${new Date().toLocaleString('es-VE')}</div>
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Pedidos Listados</div>
                        <div class="kpi-value">${orders.length}</div>
                        <div class="kpi-sub">Órdenes de trabajo</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">En Producción (Activos)</div>
                        <div class="kpi-value">${activos}</div>
                        <div class="kpi-sub">Pendientes por cerrar</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Pedidos Cerrados</div>
                        <div class="kpi-value">${cerrados}</div>
                        <div class="kpi-sub">Completados / Entregados</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Modalidad de Entrega</div>
                        <div class="kpi-value">${locales} Local / ${nacionales} Nac.</div>
                        <div class="kpi-sub">Miranda & Colina vs Envíos</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Factura</th>
                            <th>Cliente & Contacto</th>
                            <th>Tipo Flujo</th>
                            <th>Detalle de Prendas & Personalización</th>
                            <th>Entrega / Destino</th>
                            <th>Estatus Taller</th>
                            <th>Estado Cierre</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => {
                            const wType = getOrderWorkshopType(o);
                            const currentStageKey = o.estado_taller || getDefaultWorkshopStatus(o.items, o.tipo_entrega);
                            const stageInfo = getStageInfo(currentStageKey);
                            return `
                                <tr>
                                    <td style="font-family: monospace; font-weight: 900; color: ${cfg.colorPrimario};">
                                        ${o.numero_factura}<br/>
                                        <span style="font-size: 9px; color: #6b7280;">${new Date(o.created_at).toLocaleDateString('es-VE')}</span>
                                    </td>
                                    <td>
                                        <strong>${o.cliente_nombre} ${o.cliente_apellido}</strong><br/>
                                        <span style="font-size: 10px; color: #6b7280;">${o.cliente_telefono}</span>
                                    </td>
                                    <td><span class="pill pill-purple">${getWorkshopTypeLabel(wType)}</span></td>
                                    <td>
                                        ${o.items.map(it => `
                                            <div style="margin-bottom: 4px;">
                                                <strong>• ${it.quantity}x ${it.name}</strong>
                                                ${it.nombre_personalizado ? `<br/><span style="color: ${cfg.colorPrimario}; font-size: 10px;">↳ Nombre: <strong>${it.nombre_personalizado}</strong></span>` : ''}
                                                ${it.especialidad_personalizada ? `<span style="color: #4b5563; font-size: 10px;"> (${it.especialidad_personalizada})</span>` : ''}
                                                ${it.color_preferencia ? `<br/><span style="color: #6b7280; font-size: 10px;">↳ Color: ${it.color_preferencia}</span>` : ''}
                                            </div>
                                        `).join('')}
                                        ${o.notas_taller ? `<div style="font-size: 10px; color: #92400e; background: #fef3c7; padding: 3px 6px; border-radius: 4px; margin-top: 3px;">Nota: ${o.notas_taller}</div>` : ''}
                                    </td>
                                    <td>
                                        <strong>${o.tipo_entrega === 'local' ? '🏠 Local (Miranda/Colina)' : `📦 ${o.empresa_envio || 'Nacional'}`}</strong><br/>
                                        <span style="font-size: 10px; color: #4b5563;">${o.direccion_entrega}</span>
                                        ${o.numero_guia_envio ? `<br/><span style="font-family: monospace; font-size: 10px; color: #0369a1;">Guía: ${o.numero_guia_envio}</span>` : ''}
                                    </td>
                                    <td><span class="pill pill-amber">${stageInfo.icon} ${stageInfo.label}</span></td>
                                    <td>
                                        <span class="pill ${o.pedido_cerrado ? 'pill-green' : 'pill-amber'}">
                                            ${o.pedido_cerrado ? '✓ CERRADO' : 'EN CURSO'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                ${cfg.mostrarFirmas ? `
                    <div class="signatures">
                        <div class="sig-line">Jefe de Taller y Confección</div>
                        <div class="sig-line">Control de Calidad y Despacho</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div><strong>${cfg.piePaginaReporte}</strong></div>
                </div>
            </div>
        </body>
        </html>
    `;

    openPdfWindow(html);
}

// ==========================================
// 4. REPORTE DE PRODUCTOS EN STOCK / CATÁLOGO PDF
// ==========================================
export function generateStockReportPdf(
    products: Product[],
    filterSummary: string,
    pdfConfig?: Partial<PdfTemplateSettings>,
    currentBcvRate = 887.30
) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };
    const totalUnidades = products.reduce((acc, p) => acc + (p.stock !== undefined ? Number(p.stock) : 20), 0);
    const valorInventarioUsd = products.reduce((acc, p) => acc + (p.price * (p.stock !== undefined ? Number(p.stock) : 20)), 0);
    const valorInventarioBs = valorInventarioUsd * currentBcvRate;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Reporte de Productos en Stock - ${cfg.nombreEmpresa}</title>
            <style>${getBaseStyles(cfg, true)}</style>
        </head>
        <body>
            <div class="toolbar">
                <div>
                    <strong>📦 Reporte de Productos en Stock y Catálogo (${products.length} productos)</strong>
                </div>
                <div>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            ${cfg.mostrarSelloAgua ? `<div class="watermark">BOHEME STOCK</div>` : ''}

            <div class="doc-container">
                <div class="header">
                    <div class="brand-box">
                        ${cfg.mostrarLogo ? `<img src="/logo-wine.png" alt="Logo" class="brand-logo" onerror="this.style.display='none'" />` : ''}
                        <div>
                            <div class="company-name">${cfg.nombreEmpresa}</div>
                            <div class="company-meta">Inventario General de Productos, Precios en USD y Equivalente BCV</div>
                            <div class="company-meta">Sección: <strong>${filterSummary}</strong></div>
                        </div>
                    </div>
                    <div class="doc-title-box">
                        <div class="doc-badge">${cfg.encabezadoReporte}</div>
                        <div class="doc-number" style="font-size: 15px;">REPORTE DE PRODUCTOS EN STOCK</div>
                        <div class="company-meta">Fecha: ${new Date().toLocaleString('es-VE')}</div>
                        ${cfg.mostrarTasaBcv ? `<div class="company-meta">Tasa BCV: <strong>${currentBcvRate} Bs/$</strong></div>` : ''}
                    </div>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">Modelos en Catálogo</div>
                        <div class="kpi-value">${products.length}</div>
                        <div class="kpi-sub">Productos registrados</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Unidades en Stock</div>
                        <div class="kpi-value">${totalUnidades} uds.</div>
                        <div class="kpi-sub">Disponibilidad física</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Valor Inventario ($ USD)</div>
                        <div class="kpi-value">$${valorInventarioUsd.toFixed(2)}</div>
                        <div class="kpi-sub">Base en divisas</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Valor Inventario (Bs.)</div>
                        <div class="kpi-value" style="font-size: 14px;">Bs. ${valorInventarioBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div class="kpi-sub">A tasa ${currentBcvRate} Bs/$</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 55px;">Código</th>
                            <th>Producto & Descripción</th>
                            <th>Sección / Subcategoría</th>
                            <th style="text-align: center;">Stock</th>
                            <th style="text-align: right;">Precio Unit ($ USD)</th>
                            <th style="text-align: right;">Precio (Bs. BCV)</th>
                            <th style="text-align: right;">Valor Stock ($ USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => {
                            const cat = CATEGORIES[p.categoria_slug];
                            const sub = cat?.subcategories.find(s => s.id === p.subcategoria_id);
                            const stockQty = p.stock !== undefined ? Number(p.stock) : 20;
                            const priceBs = p.price * currentBcvRate;
                            return `
                                <tr>
                                    <td style="font-family: monospace; font-weight: 800;">#${p.id}</td>
                                    <td>
                                        <strong>${p.name}</strong><br/>
                                        <span style="font-size: 10px; color: #6b7280;">${p.description || ''}</span>
                                    </td>
                                    <td>
                                        <strong>${cat?.title || p.categoria_slug}</strong><br/>
                                        <span style="font-size: 10px; color: #6b7280;">${sub?.name || 'General'}</span>
                                    </td>
                                    <td style="text-align: center;">
                                        <span class="pill ${stockQty > 5 ? 'pill-green' : stockQty > 0 ? 'pill-amber' : 'pill-red'}">
                                            ${stockQty} uds
                                        </span>
                                    </td>
                                    <td style="text-align: right; font-weight: 800; color: ${cfg.colorPrimario};">$${p.price.toFixed(2)}</td>
                                    <td style="text-align: right;">Bs. ${priceBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style="text-align: right; font-weight: 800;">$${(p.price * stockQty).toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                ${cfg.mostrarFirmas ? `
                    <div class="signatures">
                        <div class="sig-line">Responsable de Almacén e Inventario</div>
                        <div class="sig-line">Administración BOHEME</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div><strong>${cfg.piePaginaReporte}</strong></div>
                </div>
            </div>
        </body>
        </html>
    `;

    openPdfWindow(html);
}

// ==========================================
// 5. EXPORTAR A CSV / EXCEL COMPATIBLE
// ==========================================
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
    const escapeCell = (val: string | number) => {
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
    };
    const csvContent = '\uFEFF' + [
        headers.map(escapeCell).join(';'),
        ...rows.map(r => r.map(escapeCell).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================
// 6. FICHAS TÉCNICAS DE PRODUCCIÓN & TALLER (4 A 6 PEDIDOS POR HOJA O INDIVIDUAL)
// ==========================================
export function generateWorkshopSheetsBatchPdf(
    orders: Order[],
    filterSummary: string,
    pdfConfig?: Partial<PdfTemplateSettings>,
    defaultDensity: '4' | '5' | '6' | '1' = '4'
) {
    const cfg: PdfTemplateSettings = { ...DEFAULT_PDF_CONFIG, ...(pdfConfig || {}) };

    const fichasHtml = orders.map((order, orderIndex) => {
        const currentStageKey = order.estado_taller || getDefaultWorkshopStatus(order.items, order.tipo_entrega);
        const stageInfo = getStageInfo(currentStageKey);
        const deliveryLabel = order.tipo_entrega === 'local'
            ? 'ENTREGA LOCAL (MCPIO. MIRANDA / MCPIO. COLINA)'
            : `ENVÍO NACIONAL (${(order.empresa_envio || 'AGENCIA').toUpperCase()})`;

        const itemsHtml = order.items.map((item, idx) => {
            let rawImg = item.image_url || '';
            if (rawImg.startsWith('[')) {
                try {
                    const parsed = JSON.parse(rawImg);
                    if (Array.isArray(parsed) && parsed.length > 0) rawImg = parsed[0];
                } catch {}
            }
            if (!rawImg) {
                if (item.categoria_slug === 'equipos-medicos') rawImg = '/cat_equipos.png';
                else if (item.categoria_slug === 'accesorios-medicos' || item.categoria_slug === 'lanyards') rawImg = '/cat_accesorios.png';
                else rawImg = '/cat_gorros.png';
            }
            const imgSrc = rawImg
                ? (rawImg.startsWith('http') || rawImg.startsWith('data:')
                    ? rawImg
                    : `${typeof window !== 'undefined' ? window.location.origin : ''}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`)
                : '';

            const specs: string[] = [];
            if (item.genero) specs.push(`<strong>Género:</strong> ${item.genero}${item.modelo ? ` • <strong>Estilo:</strong> ${item.modelo}` : ''}`);
            if (item.subcategoria_especial) specs.push(`<strong>Subcategoría Especial:</strong> ${item.subcategoria_especial}`);
            if (item.adicionales && item.adicionales.length > 0) specs.push(`<strong>Adicionales:</strong> ${item.adicionales.join(', ')}`);
            if (item.nombre_personalizado) specs.push(`<strong>Nombre a estampar / imprimir:</strong> <span class="spec-highlight">${item.nombre_personalizado}</span>`);
            if (item.texto_personalizado) specs.push(`<strong>Texto libre:</strong> "${item.texto_personalizado}"`);
            if (item.especialidad_personalizada) specs.push(`<strong>Especialidad:</strong> ${item.especialidad_personalizada}`);
            if (item.color_preferencia) specs.push(`<strong>Color:</strong> ${item.color_preferencia}`);
            if (item.detalles_personalizados) specs.push(`<strong>Notas:</strong> ${item.detalles_personalizados}`);

            return `
                <div class="ficha-item">
                    ${imgSrc ? `<img src="${imgSrc}" alt="${item.name}" class="ficha-item-img" onerror="this.style.display='none'" />` : ''}
                    <div class="ficha-item-body">
                        <div class="ficha-item-header">
                            <span class="ficha-item-title">${idx + 1}. ${item.name} (Cantidad: ${item.quantity})</span>
                            <span class="ficha-item-badge ${item.is_personalizado ? 'custom' : 'standard'}">
                                ${item.is_personalizado ? '★ PERSONALIZADO' : 'ESTÁNDAR'}
                            </span>
                        </div>
                        ${specs.length > 0 ? `<div class="ficha-item-specs">${specs.join(' &nbsp;•&nbsp; ')}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="ficha-card" data-idx="${orderIndex}">
                <div class="ficha-header">
                    <div>
                        <div class="ficha-brand">${cfg.nombreEmpresa} • FICHA TÉCNICA DE PRODUCCIÓN & TALLER</div>
                        <div class="ficha-sub">Orden de Fabricación y Confección • Factura <strong>${order.numero_factura}</strong> • Etapa: <strong>${stageInfo.icon} ${stageInfo.label}</strong></div>
                    </div>
                    <div class="ficha-delivery-badge">${deliveryLabel}</div>
                </div>

                <div class="ficha-section">
                    <div class="ficha-section-title">DATOS DEL CLIENTE & DESTINO</div>
                    <div class="ficha-client-grid">
                        <div><strong>Cliente:</strong> ${order.cliente_nombre} ${order.cliente_apellido}</div>
                        <div><strong>Cédula:</strong> ${order.cliente_cedula}</div>
                        <div><strong>Teléfono:</strong> <span style="color:#1d4ed8;text-decoration:underline;">${order.cliente_telefono}</span></div>
                        <div><strong>Fecha de Pedido:</strong> ${new Date(order.created_at).toLocaleDateString('es-VE')}</div>
                        <div class="ficha-client-full"><strong>Dirección / Destino:</strong> ${order.direccion_entrega}${order.numero_guia_envio ? ` &nbsp;|&nbsp; <strong>Guía:</strong> ${order.numero_guia_envio}` : ''}</div>
                    </div>
                </div>

                <div class="ficha-section">
                    <div class="ficha-section-title">PRENDAS Y ESPECIFICACIONES DE PERSONALIZACIÓN</div>
                    <div class="ficha-items-list">
                        ${itemsHtml}
                    </div>
                    ${order.notas_taller ? `<div class="ficha-notes"><strong>Notas de Taller:</strong> ${order.notas_taller}</div>` : ''}
                </div>

                <div class="ficha-section ficha-stations-section">
                    <div class="ficha-section-title">CONTROL DE ESTACIONES Y CALIDAD</div>
                    <div class="ficha-checks">
                        <span class="ficha-check"><span class="box"></span> 1. Diseño Aprobado</span>
                        <span class="ficha-check"><span class="box"></span> 2. Imprenta / Sublimado</span>
                        <span class="ficha-check"><span class="box"></span> 3. Confección / Costura</span>
                        <span class="ficha-check"><span class="box"></span> 4. Acabado & Limpieza</span>
                        <span class="ficha-check"><span class="box"></span> 5. Embalaje</span>
                        <span class="ficha-check"><span class="box"></span> 6. Despacho / Entrega</span>
                    </div>
                    <div class="ficha-sigs">
                        <div>Firma Responsable Taller: ________________________</div>
                        <div>Firma Control de Calidad: ________________________</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Fichas Técnicas de Taller (${orders.length} pedidos) - ${cfg.nombreEmpresa}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                    color: #1f2937;
                    background: #f3f4f6;
                    padding: 16px;
                    font-size: 10px;
                    line-height: 1.3;
                }
                .toolbar {
                    max-width: 900px;
                    margin: 0 auto 14px auto;
                    background: ${cfg.colorPrimario};
                    color: white;
                    padding: 10px 16px;
                    border-radius: 12px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                }
                .toolbar-controls {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    align-items: center;
                }
                .toolbar-btn {
                    background: white;
                    color: ${cfg.colorPrimario};
                    border: none;
                    padding: 7px 13px;
                    border-radius: 8px;
                    font-weight: 800;
                    font-size: 11px;
                    cursor: pointer;
                }
                .toolbar-btn.mode-btn {
                    background: rgba(255,255,255,0.16);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    font-weight: 700;
                }
                .toolbar-btn.mode-btn.active {
                    background: #D96B27;
                    color: white;
                    border-color: #D96B27;
                }
                .toolbar-btn.secondary {
                    background: rgba(255,255,255,0.15);
                    color: white;
                }
                .sheet-summary-bar {
                    max-width: 900px;
                    margin: 0 auto 10px auto;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 6px 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 10px;
                    color: #4b5563;
                }
                .fichas-wrapper {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    padding: 10px 14px;
                    border-radius: 10px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                }

                /* Ficha Card Base (4 por hoja default) */
                .ficha-card {
                    border: 1.5px solid ${cfg.colorPrimario}40;
                    border-radius: 8px;
                    padding: 7px 10px;
                    margin-bottom: 8px;
                    background: #ffffff;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                .ficha-header {
                    border-bottom: 1.5px solid ${cfg.colorPrimario};
                    padding-bottom: 4px;
                    margin-bottom: 5px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                }
                .ficha-brand {
                    font-size: 11px;
                    font-weight: 900;
                    color: ${cfg.colorPrimario};
                    letter-spacing: 0.2px;
                }
                .ficha-sub {
                    font-size: 8.5px;
                    color: #4b5563;
                }
                .ficha-delivery-badge {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 2px 8px;
                    border-radius: 999px;
                    font-weight: 800;
                    font-size: 8px;
                    border: 1px solid #f59e0b;
                    white-space: nowrap;
                }
                .ficha-section {
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 4px 8px;
                    margin-bottom: 4px;
                }
                .ficha-stations-section {
                    margin-bottom: 0;
                    background: #fafafa;
                }
                .ficha-section-title {
                    font-size: 8px;
                    font-weight: 900;
                    color: ${cfg.colorPrimario};
                    text-transform: uppercase;
                    margin-bottom: 3px;
                    letter-spacing: 0.3px;
                }
                .ficha-client-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 2px 8px;
                    font-size: 8.5px;
                }
                .ficha-client-full {
                    grid-column: 1 / -1;
                    margin-top: 1px;
                }
                .ficha-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .ficha-item {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    background: #f9fafb;
                    border: 1px solid #f3f4f6;
                    border-radius: 5px;
                    padding: 3px 6px;
                }
                .ficha-item-img {
                    width: 28px;
                    height: 28px;
                    object-fit: cover;
                    border-radius: 4px;
                    border: 1px solid #d1d5db;
                    flex-shrink: 0;
                    background: #fff;
                }
                .ficha-item-body {
                    flex: 1;
                    min-width: 0;
                }
                .ficha-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 6px;
                }
                .ficha-item-title {
                    font-weight: 800;
                    font-size: 9px;
                    color: #111827;
                }
                .ficha-item-badge {
                    font-size: 7.5px;
                    font-weight: 900;
                    padding: 1px 5px;
                    border-radius: 4px;
                    white-space: nowrap;
                }
                .ficha-item-badge.custom {
                    color: #b45309;
                    background: #fef3c7;
                }
                .ficha-item-badge.standard {
                    color: ${cfg.colorPrimario};
                }
                .ficha-item-specs {
                    font-size: 8px;
                    color: #374151;
                    margin-top: 1px;
                }
                .spec-highlight {
                    color: ${cfg.colorPrimario};
                    font-weight: 800;
                    background: #fce7f3;
                    padding: 0 3px;
                    border-radius: 3px;
                }
                .ficha-notes {
                    margin-top: 3px;
                    font-size: 8px;
                    color: #92400e;
                    background: #fef3c7;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .ficha-checks {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px 10px;
                    font-size: 8px;
                    font-weight: 700;
                    color: #1f2937;
                }
                .ficha-check {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                }
                .ficha-check .box {
                    display: inline-block;
                    width: 9px;
                    height: 9px;
                    border: 1.3px solid #4b5563;
                    border-radius: 2px;
                    background: white;
                }
                .ficha-sigs {
                    margin-top: 4px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 7.5px;
                    color: #6b7280;
                }

                /* DENSITY MODES */
                /* Mode 5 per sheet: ultra-compact vertical */
                body[data-density="5"] .ficha-card {
                    padding: 4px 8px;
                    margin-bottom: 5px;
                }
                body[data-density="5"] .ficha-header {
                    padding-bottom: 2px;
                    margin-bottom: 3px;
                }
                body[data-density="5"] .ficha-brand { font-size: 9.5px; }
                body[data-density="5"] .ficha-sub { font-size: 7.5px; }
                body[data-density="5"] .ficha-section { padding: 2.5px 6px; margin-bottom: 2.5px; }
                body[data-density="5"] .ficha-section-title { font-size: 7px; margin-bottom: 1.5px; }
                body[data-density="5"] .ficha-client-grid { font-size: 7.8px; }
                body[data-density="5"] .ficha-item { padding: 2px 5px; }
                body[data-density="5"] .ficha-item-img { width: 22px; height: 22px; }
                body[data-density="5"] .ficha-item-title { font-size: 8px; }
                body[data-density="5"] .ficha-item-specs { font-size: 7.5px; }
                body[data-density="5"] .ficha-checks { font-size: 7.3px; gap: 2px 8px; }
                body[data-density="5"] .ficha-sigs { margin-top: 2px; font-size: 7px; }

                /* Mode 6 per sheet: 2 columns x 3 rows grid */
                body[data-density="6"] .fichas-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                body[data-density="6"] .ficha-card {
                    margin-bottom: 0;
                    padding: 6px 8px;
                }
                body[data-density="6"] .ficha-brand { font-size: 9.5px; }
                body[data-density="6"] .ficha-sub { font-size: 7.5px; }
                body[data-density="6"] .ficha-delivery-badge { font-size: 7px; padding: 1px 5px; }
                body[data-density="6"] .ficha-client-grid {
                    grid-template-columns: 1fr 1fr;
                    font-size: 8px;
                }
                body[data-density="6"] .ficha-item-img { width: 24px; height: 24px; }
                body[data-density="6"] .ficha-checks { font-size: 7.5px; gap: 3px 6px; }
                body[data-density="6"] .ficha-sigs { font-size: 7px; }

                /* Mode 1 per sheet: large individual ficha */
                body[data-density="1"] .ficha-card {
                    padding: 16px 18px;
                    margin-bottom: 18px;
                }
                body[data-density="1"] .ficha-brand { font-size: 15px; }
                body[data-density="1"] .ficha-sub { font-size: 11px; }
                body[data-density="1"] .ficha-delivery-badge { font-size: 10px; padding: 4px 10px; }
                body[data-density="1"] .ficha-section { padding: 10px 12px; margin-bottom: 10px; }
                body[data-density="1"] .ficha-section-title { font-size: 10px; margin-bottom: 6px; }
                body[data-density="1"] .ficha-client-grid { grid-template-columns: 1fr 1fr; font-size: 11px; gap: 6px 12px; }
                body[data-density="1"] .ficha-item { padding: 8px 10px; }
                body[data-density="1"] .ficha-item-img { width: 46px; height: 46px; }
                body[data-density="1"] .ficha-item-title { font-size: 12px; }
                body[data-density="1"] .ficha-item-specs { font-size: 10.5px; margin-top: 3px; }
                body[data-density="1"] .ficha-checks { font-size: 10px; gap: 8px 14px; }
                body[data-density="1"] .ficha-sigs { margin-top: 16px; font-size: 10px; }

                .page-break-marker {
                    page-break-after: always;
                    break-after: page;
                }

                @media print {
                    @page {
                        size: letter portrait;
                        margin: 6mm 7mm;
                    }
                    body {
                        background: white;
                        padding: 0;
                    }
                    .toolbar {
                        display: none !important;
                    }
                    .fichas-wrapper {
                        max-width: 100%;
                        padding: 0;
                        box-shadow: none;
                    }
                    .sheet-summary-bar {
                        max-width: 100%;
                        margin-bottom: 6px;
                        padding: 3px 8px;
                    }
                }
            </style>
        </head>
        <body data-density="${defaultDensity}">
            <div class="toolbar">
                <div>
                    <div style="font-size: 13px; font-weight: 900;">✂️ Fichas Técnicas de Taller (${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'})</div>
                    <div style="font-size: 10px; opacity: 0.85;">Filtro: ${filterSummary}</div>
                </div>
                <div class="toolbar-controls">
                    <span style="font-size: 10px; font-weight: 700; margin-right: 2px;">Pedidos por hoja:</span>
                    <button class="toolbar-btn mode-btn" id="btn-mode-4" onclick="setDensity('4')">4 por hoja (Recomendado)</button>
                    <button class="toolbar-btn mode-btn" id="btn-mode-5" onclick="setDensity('5')">5 por hoja</button>
                    <button class="toolbar-btn mode-btn" id="btn-mode-6" onclick="setDensity('6')">6 por hoja (2x3)</button>
                    <button class="toolbar-btn mode-btn" id="btn-mode-1" onclick="setDensity('1')">1 por hoja</button>
                    <button class="toolbar-btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
                    <button class="toolbar-btn secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>

            <div class="sheet-summary-bar">
                <div><strong>${cfg.nombreEmpresa}</strong> • Guía Diaria de Taller y Confección • <strong>${filterSummary}</strong></div>
                <div>Total en guía: <strong>${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'}</strong> • Impreso: ${new Date().toLocaleString('es-VE')}</div>
            </div>

            <div class="fichas-wrapper">
                <div class="fichas-grid" id="fichas-container">
                    ${fichasHtml}
                </div>
            </div>

            <script>
                function setDensity(mode) {
                    document.body.setAttribute('data-density', mode);
                    ['4', '5', '6', '1'].forEach(function(m) {
                        var btn = document.getElementById('btn-mode-' + m);
                        if (btn) {
                            if (m === mode) btn.classList.add('active');
                            else btn.classList.remove('active');
                        }
                    });
                    var perPage = parseInt(mode, 10) || 4;
                    var cards = document.querySelectorAll('.ficha-card');
                    cards.forEach(function(card, idx) {
                        card.classList.remove('page-break-marker');
                        if ((idx + 1) % perPage === 0 && idx < cards.length - 1) {
                            card.classList.add('page-break-marker');
                        }
                    });
                }
                setDensity('${defaultDensity}');
            </script>
        </body>
        </html>
    `;

    openPdfWindow(html);
}
