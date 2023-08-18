# Dynamic Module

**動態模組(Dynamic Module)** 可以用很簡單的方式去客製化 Provider 的內容，使該 Module 的 Provider 動態化。

## 設計 Dynamic Module

Dynamic Module 最常遇到的情境就是環境變數管理，原因是管理環境變數的邏輯通常是不變的，會變的部分僅僅是讀取環境變數的檔案路徑等，透過動態模組的機制成功將其抽離成共用元件，降低耦合度。