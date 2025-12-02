# Instalação e uso

## Baixe o arquivo downdetector.js e o coloque em /usr/lib/zabbix/externalscripts

## Instale as dependências 
```
# apt update && apt upgrade -y

# apt install -y chromium nodejs npm

# cd /usr/lib/zabbix/externalscripts

# npm install puppeteer-core

```

## Dê as permissões necessárias
```
# chmod +x /usr/lib/zabbix/externalscripts/downdetector.js
```

## Teste manualmente
```
# node /usr/lib/zabbix/externalscripts/downdetector.js whatsapp
```
## Você deverá ver a saída assim.
```
{
  "service": "whatsapp",
  "status": "ok",
  "message": "Não há problemas detectados",
  "raw": "OK: Não há problemas detectados no serviço 'whatsapp'"
}
```

## Aumente o timeout do zabbix 
### Deve estar em Timeout=4, mude para Timeout=15
```
# nano /etc/zabbix/zabbix_server.conf
```

## Reinicie o zabbix-server
``` 
# systemctl restart zabbix-server
```

## Vá para o zabbix criar o item de "Monitoramento Externo"
`` 
key = downdetector["whatsapp"]
Intervalo de atualização = 5m <-- Não abuse, deixe o tempo justo, não reduza tanto.
JSONPath = $.status

``
