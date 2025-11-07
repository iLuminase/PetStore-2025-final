@echo off
title Gateway API - Optimized

echo Starting Gateway API with optimized JVM settings...

set JAVA_OPTS=-Xms256m -Xmx384m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication

cd be\gateway-api
mvn spring-boot:run -Dspring-boot.run.jvmArguments="%JAVA_OPTS%"