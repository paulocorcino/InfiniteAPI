#!/bin/bash
#
# Script para aplicar o fix de listMessage no rsalcara/InfiniteAPI
# Corrige: biz node (product_list v2) + conversão nativeFlow → listMessage + logs
#
set -e

echo "============================================"
echo " FIX LIST MESSAGE - rsalcara/InfiniteAPI"
echo "============================================"
echo ""

# Verificar se estamos dentro do repo rsalcara/InfiniteAPI
if [ ! -f "src/Socket/messages-send.ts" ]; then
    echo "ERRO: Execute este script dentro do diretório rsalcara/InfiniteAPI"
    echo "Exemplo: cd /path/to/rsalcara/InfiniteAPI && bash fix-list-message.sh"
    exit 1
fi

echo "[1/4] Adicionando remote infinitezap..."
git remote remove infinitezap 2>/dev/null || true
git remote add infinitezap https://github.com/infinitezap/Teste_InfiniteAPI.git

echo "[2/4] Buscando branch com o fix..."
git fetch infinitezap claude/fix-message-delivery-XlMLH

echo "[3/4] Cherry-picking os 2 commits do fix..."
echo "  -> bd7c691: biz node diferenciado (product_list v2)"
echo "  -> 191776a: conversão nativeFlowMessage → listMessage"
git cherry-pick bd7c691 191776a --strategy-option=theirs || {
    echo ""
    echo "Se houve conflito, resolvendo com a versão do fix..."
    git checkout --theirs src/Socket/messages-send.ts 2>/dev/null || true
    git add src/Socket/messages-send.ts
    git cherry-pick --continue --no-edit 2>/dev/null || true
}

echo ""
echo "[4/4] Verificando que o fix está presente..."
echo ""

FILE="src/Socket/messages-send.ts"

CHECK1=$(grep -c "product_list" "$FILE" 2>/dev/null || echo "0")
CHECK2=$(grep -c "\[BIZ NODE\]" "$FILE" 2>/dev/null || echo "0")
CHECK3=$(grep -c "\[STANZA\]" "$FILE" 2>/dev/null || echo "0")
CHECK4=$(grep -c "\[LIST CONVERT\]" "$FILE" 2>/dev/null || echo "0")

echo "  product_list (biz node lista): $CHECK1 ocorrências"
echo "  [BIZ NODE] (log diagnóstico): $CHECK2 ocorrências"
echo "  [STANZA] (log stanza):        $CHECK3 ocorrências"
echo "  [LIST CONVERT] (conversão):   $CHECK4 ocorrências"
echo ""

if [ "$CHECK1" -gt "0" ] && [ "$CHECK2" -gt "0" ] && [ "$CHECK3" -gt "0" ] && [ "$CHECK4" -gt "0" ]; then
    echo "============================================"
    echo " FIX APLICADO COM SUCESSO!"
    echo "============================================"
    echo ""
    echo "Agora faça o build e deploy:"
    echo "  npm run build"
    echo "  git push origin master"
    echo ""
else
    echo "============================================"
    echo " ATENÇÃO: Alguma parte do fix está faltando!"
    echo "============================================"
    echo ""
    echo "Verifique manualmente o arquivo:"
    echo "  $FILE"
    echo ""
fi
