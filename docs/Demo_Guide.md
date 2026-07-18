# NyayaOS Demo Guide

This guide describes how to trigger and walk through the five demo scenario profiles integrated into the NyayaOS Citizen Portal and Judge Dashboard.

---

## 🎭 Scenario 1: Happy Path (`happy_path`)
* **Case Type**: Property Dispute
* **Citizen ID**: `cit-9988`
* **Location**: Bengaluru, Karnataka
* **Document Type**: Sale Deed
* **Demo Profile**: `happy_path`
* **Expected Result**: COMPLETED. Legal precedent match found (e.g. `Rajamani vs. Karnataka State - Specific Relief Act Section 6`).

## 🎭 Scenario 2: Identity Mismatch (`identity_failure`)
* **Citizen ID**: `cit-9988`
* **Demo Profile**: `identity_failure`
* **Expected Result**: FAILED. Error: `bio-database record mismatch`.

## 🎭 Scenario 3: Missing Documents (`missing_documents`)
* **Demo Profile**: `missing_documents`
* **Expected Result**: FAILED. Error: `sale deed document is missing required signatures`.

## 🎭 Scenario 4: Wrong Jurisdiction (`wrong_jurisdiction`)
* **Location**: Bengaluru, Karnataka (but parcel matches Mumbai jurisdiction database)
* **Demo Profile**: `wrong_jurisdiction`
* **Expected Result**: FAILED. Error: `Filing belongs to Mumbai Land Tribunal, not local court`.

## 🎭 Scenario 5: Duplicate Filing (`duplicate_filing`)
* **Plot ID**: `plot-7412A`
* **Demo Profile**: `duplicate_filing`
* **Expected Result**: FAILED. Error: `Case has already been registered on this property parcel`.
