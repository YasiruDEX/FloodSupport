import { SOSRecord, DistrictSummary } from '@/types';

export function generateDistrictSummary(records: SOSRecord[]): DistrictSummary[] {
  const districtMap = new Map<string, DistrictSummary>();

  for (const record of records) {
    const district = record.district?.trim() || 'Unknown';
    
    if (!districtMap.has(district)) {
      districtMap.set(district, {
        district,
        total: 0,
        totalPeople: 0,
        pending: 0,
        verified: 0,
        acknowledged: 0,
        inProgress: 0,
        rescued: 0,
        completed: 0,
        cannotContact: 0,
        missing: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        trapped: 0,
        foodWater: 0,
        medical: 0,
        rescueAssistance: 0,
        missingPerson: 0,
        other: 0,
        hasChildren: 0,
        hasElderly: 0,
        hasDisabled: 0,
        hasMedicalEmergency: 0,
      });
    }

    const d = districtMap.get(district)!;
    d.total += 1;
    d.totalPeople += record.numberOfPeople || 0;

    // Status counts
    const status = (record.status || '').toUpperCase();
    switch (status) {
      case 'VERIFIED': break;
      case 'RESCUED': d.rescued += 1; break;
      case 'PENDING': d.pending += 1; break;
      case 'CANNOT_CONTACT': d.cannotContact += 1; break;
      case 'ACKNOWLEDGED': d.acknowledged += 1; break;
      case 'IN_PROGRESS': d.inProgress += 1; break;
      case 'COMPLETED': d.completed += 1; d.rescued += 1; break;
    }
    
    // Verified count: everything except PENDING, CANCELLED, and CANNOT_CONTACT
    if (status !== 'PENDING' && status !== 'CANCELLED' && status !== 'CANNOT_CONTACT') {
      d.verified += 1;
    }

    // Priority counts
    const priority = (record.priority || '').toUpperCase();
    switch (priority) {
      case 'CRITICAL': d.critical += 1; break;
      case 'HIGH': d.high += 1; break;
      case 'MEDIUM': d.medium += 1; break;
      case 'LOW': d.low += 1; break;
    }

    // Emergency type counts
    const emergencyType = (record.emergencyType || '').toUpperCase();
    if (emergencyType.includes('TRAPPED')) {
      d.trapped += 1;
    } else if (emergencyType.includes('FOOD') || emergencyType.includes('WATER')) {
      d.foodWater += 1;
    } else if (emergencyType.includes('MEDICAL')) {
      d.medical += 1;
    } else if (emergencyType.includes('RESCUE')) {
      d.rescueAssistance += 1;
    } else if (emergencyType.includes('MISSING')) {
      d.missingPerson += 1;
      d.missing += 1;
    } else {
      d.other += 1;
    }

    // Vulnerable groups
    if (record.hasChildren) d.hasChildren += 1;
    if (record.hasElderly) d.hasElderly += 1;
    if (record.hasDisabled) d.hasDisabled += 1;
    if (record.hasMedicalEmergency) d.hasMedicalEmergency += 1;
  }

  return Array.from(districtMap.values()).sort((a, b) => b.total - a.total);
}

export function calculateTotals(summaries: DistrictSummary[]): DistrictSummary {
  return summaries.reduce(
    (acc, curr) => ({
      district: 'TOTAL',
      total: acc.total + curr.total,
      totalPeople: acc.totalPeople + curr.totalPeople,
      pending: acc.pending + curr.pending,
      verified: acc.verified + curr.verified,
      acknowledged: acc.acknowledged + curr.acknowledged,
      inProgress: acc.inProgress + curr.inProgress,
      rescued: acc.rescued + curr.rescued,
      completed: acc.completed + curr.completed,
      cannotContact: acc.cannotContact + curr.cannotContact,
      missing: acc.missing + curr.missing,
      critical: acc.critical + curr.critical,
      high: acc.high + curr.high,
      medium: acc.medium + curr.medium,
      low: acc.low + curr.low,
      trapped: acc.trapped + curr.trapped,
      foodWater: acc.foodWater + curr.foodWater,
      medical: acc.medical + curr.medical,
      rescueAssistance: acc.rescueAssistance + curr.rescueAssistance,
      missingPerson: acc.missingPerson + curr.missingPerson,
      other: acc.other + curr.other,
      hasChildren: acc.hasChildren + curr.hasChildren,
      hasElderly: acc.hasElderly + curr.hasElderly,
      hasDisabled: acc.hasDisabled + curr.hasDisabled,
      hasMedicalEmergency: acc.hasMedicalEmergency + curr.hasMedicalEmergency,
    }),
    {
      district: 'TOTAL',
      total: 0,
      totalPeople: 0,
      pending: 0,
      verified: 0,
      acknowledged: 0,
      inProgress: 0,
      rescued: 0,
      completed: 0,
      cannotContact: 0,
      missing: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      trapped: 0,
      foodWater: 0,
      medical: 0,
      rescueAssistance: 0,
      missingPerson: 0,
      other: 0,
      hasChildren: 0,
      hasElderly: 0,
      hasDisabled: 0,
      hasMedicalEmergency: 0,
    }
  );
}
