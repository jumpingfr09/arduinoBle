#!/bin/bash
# GitHub 리포지토리 연결 및 푸시 스크립트

cd /Users/eun-younglee/Desktop/web

# Git 저장소 초기화 (이미 되어 있다면 무시됨)
git init

# 원격 리포지토리 추가
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/jumpingfr09/arduinoBle.git

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Add web app with buttons and circle color changer"

# main 브랜치로 설정 (필요한 경우)
git branch -M main

# 푸시
git push -u origin main

echo "완료되었습니다!"
