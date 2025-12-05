#!/bin/bash
# =====================================================
# Script de Verificación de Entorno - Linux/Mac
# Sistema POS para Supermercado
# =====================================================
#
# ¿Qué hace este script?
# Verifica que tu computadora tenga todas las herramientas
# necesarias para desarrollar el sistema POS.
#
# Cómo ejecutarlo:
# 1. Abrí la terminal
# 2. Navegá a la carpeta del proyecto: cd ~/Sistema_VisualStudio
# 3. Dale permisos: chmod +x setup/check_environment.sh
# 4. Ejecutalo: ./setup/check_environment.sh
#
# =====================================================

# Colores para la terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # Sin color

echo -e "\n${CYAN}========================================"
echo -e "  VERIFICACIÓN DE ENTORNO - POS SYSTEM  "
echo -e "========================================${NC}\n"

all_good=true

# =====================================================
# 1. Node.js (IMPRESCINDIBLE)
# =====================================================
echo -e "${YELLOW}🔍 Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "   ${GREEN}✅ Node.js instalado: $node_version${NC}"
else
    echo -e "   ${RED}❌ Node.js NO instalado${NC}"
    echo -e "   ${NC}📥 Instalalo desde: https://nodejs.org/${NC}"
    echo -e "   ${NC}💡 O usa nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\n${NC}"
    all_good=false
fi

# =====================================================
# 2. npm (IMPRESCINDIBLE - viene con Node.js)
# =====================================================
echo -e "${YELLOW}🔍 Verificando npm (Node Package Manager)...${NC}"
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo -e "   ${GREEN}✅ npm instalado: v$npm_version${NC}"
else
    echo -e "   ${RED}❌ npm NO instalado${NC}"
    echo -e "   ${NC}💡 Normalmente viene con Node.js, reinstalá Node.js\n${NC}"
    all_good=false
fi

# =====================================================
# 3. Git (RECOMENDADO - para control de versiones)
# =====================================================
echo -e "${YELLOW}🔍 Verificando Git...${NC}"
if command -v git &> /dev/null; then
    git_version=$(git --version)
    echo -e "   ${GREEN}✅ Git instalado: $git_version${NC}"
else
    echo -e "   ${YELLOW}⚠️  Git NO instalado (recomendado)${NC}"
    echo -e "   ${NC}📥 Ubuntu/Debian: sudo apt-get install git${NC}"
    echo -e "   ${NC}📥 Mac: brew install git${NC}"
    echo -e "   ${NC}💡 Git te ayuda a guardar versiones del código\n${NC}"
fi

# =====================================================
# 4. Editor de Código (RECOMENDADO)
# =====================================================
echo -e "${YELLOW}🔍 Verificando editor de código...${NC}"
if command -v cursor &> /dev/null; then
    echo -e "   ${GREEN}✅ Cursor instalado (excelente)${NC}"
elif command -v code &> /dev/null; then
    echo -e "   ${GREEN}✅ VS Code instalado (excelente)${NC}"
else
    echo -e "   ${YELLOW}⚠️  No se detectó VS Code ni Cursor${NC}"
    echo -e "   ${NC}📥 Cursor: https://cursor.sh/${NC}"
    echo -e "   ${NC}📥 VS Code: https://code.visualstudio.com/\n${NC}"
fi

# =====================================================
# 5. Python (OPCIONAL - para algunas herramientas)
# =====================================================
echo -e "${YELLOW}🔍 Verificando Python (opcional)...${NC}"
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version)
    echo -e "   ${GREEN}✅ Python instalado: $python_version${NC}"
elif command -v python &> /dev/null; then
    python_version=$(python --version)
    echo -e "   ${GREEN}✅ Python instalado: $python_version${NC}"
else
    echo -e "   ${GRAY}ℹ️  Python no instalado (opcional)${NC}"
fi

# =====================================================
# RESUMEN FINAL
# =====================================================
echo -e "\n${CYAN}========================================"
if [ "$all_good" = true ]; then
    echo -e "  ${GREEN}✅ ¡TODO LISTO PARA EMPEZAR!  ${NC}"
    echo -e "${CYAN}========================================${NC}\n"
    echo -e "${GREEN}🚀 Podés comenzar con la Fase 1: Elegir stack tecnológico${NC}\n"
else
    echo -e "  ${YELLOW}⚠️  FALTAN HERRAMIENTAS IMPRESCINDIBLES  ${NC}"
    echo -e "${CYAN}========================================${NC}\n"
    echo -e "${YELLOW}📋 Instalá las herramientas marcadas con ❌ y volvé a ejecutar este script.${NC}\n"
fi

# =====================================================
# INFORMACIÓN ADICIONAL
# =====================================================
echo -e "${CYAN}ℹ️  Información del sistema:${NC}"
echo -e "   ${GRAY}• Sistema operativo: $(uname -s)${NC}"
echo -e "   ${GRAY}• Arquitectura: $(uname -m)${NC}"
echo -e "   ${GRAY}• Carpeta actual: $(pwd)${NC}\n"

echo -e "${CYAN}📚 Para más ayuda, leé: docs/prompt_inicial.md${NC}\n"

