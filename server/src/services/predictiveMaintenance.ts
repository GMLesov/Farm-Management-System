// Predictive Maintenance & Alert System
// Monitors equipment, animals, and crops for potential issues

interface MaintenanceRecord {
  equipmentId: string;
  equipmentName: string;
  lastMaintenance: Date;
  usageHours: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
}

interface PredictiveAlert {
  id: string;
  type: 'maintenance' | 'health' | 'crop' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedItem: {
    id: string;
    name: string;
    type: string;
  };
  predictedDate: Date;
  recommendations: string[];
  estimatedCost?: number;
}

class PredictiveMaintenanceSystem {
  // Analyze equipment for maintenance needs
  async analyzeEquipmentMaintenance(equipment: any[]): Promise<PredictiveAlert[]> {
    const alerts: PredictiveAlert[] = [];

    for (const item of equipment) {
      const daysSinceLastMaintenance = item.lastMaintenance 
        ? Math.floor((Date.now() - new Date(item.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Check maintenance schedule
      if (daysSinceLastMaintenance > 90) {
        alerts.push({
          id: `maint-${item._id}`,
          type: 'maintenance',
          severity: daysSinceLastMaintenance > 180 ? 'high' : 'medium',
          title: `${item.name} Requires Maintenance`,
          description: `Last maintenance was ${daysSinceLastMaintenance} days ago`,
          affectedItem: {
            id: item._id,
            name: item.name,
            type: 'equipment'
          },
          predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          recommendations: [
            'Schedule routine maintenance',
            'Inspect for wear and tear',
            'Check fluid levels and filters',
            'Test all safety features'
          ],
          estimatedCost: 150
        });
      }

      // Check usage hours
      if (item.usageHours > 500 && !item.lastOilChange) {
        alerts.push({
          id: `oil-${item._id}`,
          type: 'maintenance',
          severity: 'medium',
          title: `${item.name} Needs Oil Change`,
          description: `Current usage: ${item.usageHours} hours`,
          affectedItem: {
            id: item._id,
            name: item.name,
            type: 'equipment'
          },
          predictedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          recommendations: [
            'Change engine oil',
            'Replace oil filter',
            'Check other fluid levels'
          ],
          estimatedCost: 75
        });
      }
    }

    return alerts;
  }

  // Analyze animal health patterns
  async analyzeAnimalHealth(animals: any[]): Promise<PredictiveAlert[]> {
    const alerts: PredictiveAlert[] = [];

    for (const animal of animals) {
      // Check vaccination schedule
      if (animal.lastVaccination) {
        const daysSinceVaccination = Math.floor((Date.now() - new Date(animal.lastVaccination).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceVaccination > 300) {
          alerts.push({
            id: `vacc-${animal._id}`,
            type: 'health',
            severity: daysSinceVaccination > 365 ? 'high' : 'medium',
            title: `${animal.name || animal.tagNumber} Vaccination Due`,
            description: `Last vaccination was ${daysSinceVaccination} days ago`,
            affectedItem: {
              id: animal._id,
              name: animal.name || animal.tagNumber,
              type: 'animal'
            },
            predictedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            recommendations: [
              'Schedule veterinary visit',
              'Prepare vaccination records',
              'Check for any symptoms'
            ],
            estimatedCost: 50
          });
        }
      }

      // Check weight changes (potential health issue)
      if (animal.weightHistory && animal.weightHistory.length > 2) {
        const recentWeights = animal.weightHistory.slice(-3);
        const weightLoss = recentWeights[0].weight - recentWeights[recentWeights.length - 1].weight;
        
        if (weightLoss > 10) {
          alerts.push({
            id: `weight-${animal._id}`,
            type: 'health',
            severity: 'high',
            title: `${animal.name || animal.tagNumber} Weight Loss Detected`,
            description: `Lost ${weightLoss}kg in recent measurements`,
            affectedItem: {
              id: animal._id,
              name: animal.name || animal.tagNumber,
              type: 'animal'
            },
            predictedDate: new Date(),
            recommendations: [
              'Immediate veterinary examination',
              'Check feed quality and quantity',
              'Monitor for illness symptoms',
              'Isolate if necessary'
            ]
          });
        }
      }

      // Check breeding cycle
      if (animal.species === 'cattle' && animal.gender === 'female' && animal.lastBreeding) {
        const daysSinceBreeding = Math.floor((Date.now() - new Date(animal.lastBreeding).getTime()) / (1000 * 60 * 60 * 24));
        const expectedCalving = 283; // Cattle gestation period
        
        if (daysSinceBreeding > expectedCalving - 30 && daysSinceBreeding < expectedCalving) {
          alerts.push({
            id: `calving-${animal._id}`,
            type: 'health',
            severity: 'medium',
            title: `${animal.name || animal.tagNumber} Calving Soon`,
            description: `Expected calving in approximately ${expectedCalving - daysSinceBreeding} days`,
            affectedItem: {
              id: animal._id,
              name: animal.name || animal.tagNumber,
              type: 'animal'
            },
            predictedDate: new Date(Date.now() + (expectedCalving - daysSinceBreeding) * 24 * 60 * 60 * 1000),
            recommendations: [
              'Prepare calving area',
              'Have veterinary contact ready',
              'Monitor closely',
              'Ensure proper nutrition'
            ]
          });
        }
      }
    }

    return alerts;
  }

  // Analyze crop health and growth patterns
  async analyzeCropHealth(crops: any[]): Promise<PredictiveAlert[]> {
    const alerts: PredictiveAlert[] = [];

    for (const crop of crops) {
      // Check harvest date
      if (crop.expectedHarvestDate) {
        const daysUntilHarvest = Math.floor((new Date(crop.expectedHarvestDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilHarvest > 0 && daysUntilHarvest < 14) {
          alerts.push({
            id: `harvest-${crop._id}`,
            type: 'crop',
            severity: daysUntilHarvest < 7 ? 'high' : 'medium',
            title: `${crop.cropType} Harvest Approaching`,
            description: `Harvest expected in ${daysUntilHarvest} days`,
            affectedItem: {
              id: crop._id,
              name: crop.cropType,
              type: 'crop'
            },
            predictedDate: new Date(crop.expectedHarvestDate),
            recommendations: [
              'Prepare harvesting equipment',
              'Arrange storage facilities',
              'Schedule labor',
              'Check market prices'
            ]
          });
        }
      }

      // Check irrigation needs
      if (crop.lastIrrigation) {
        const daysSinceIrrigation = Math.floor((Date.now() - new Date(crop.lastIrrigation).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceIrrigation > 7 && crop.status === 'growing') {
          alerts.push({
            id: `irrigation-${crop._id}`,
            type: 'crop',
            severity: daysSinceIrrigation > 10 ? 'high' : 'medium',
            title: `${crop.cropType} Needs Irrigation`,
            description: `Last irrigated ${daysSinceIrrigation} days ago`,
            affectedItem: {
              id: crop._id,
              name: crop.cropType,
              type: 'crop'
            },
            predictedDate: new Date(),
            recommendations: [
              'Schedule irrigation immediately',
              'Check soil moisture levels',
              'Inspect irrigation system'
            ]
          });
        }
      }

      // Check pest control
      if (crop.lastPestControl) {
        const daysSincePestControl = Math.floor((Date.now() - new Date(crop.lastPestControl).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSincePestControl > 30) {
          alerts.push({
            id: `pest-${crop._id}`,
            type: 'crop',
            severity: 'medium',
            title: `${crop.cropType} Pest Control Due`,
            description: `Last pest control was ${daysSincePestControl} days ago`,
            affectedItem: {
              id: crop._id,
              name: crop.cropType,
              type: 'crop'
            },
            predictedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            recommendations: [
              'Inspect for pest activity',
              'Apply appropriate treatment',
              'Monitor crop health'
            ],
            estimatedCost: 100
          });
        }
      }
    }

    return alerts;
  }

  // Analyze resource levels (feed, fuel, supplies)
  async analyzeResourceLevels(inventory: any[]): Promise<PredictiveAlert[]> {
    const alerts: PredictiveAlert[] = [];

    for (const item of inventory) {
      const currentStock = item.quantity || 0;
      const reorderPoint = item.reorderPoint || item.minQuantity || 10;
      const averageUsage = item.averageMonthlyUsage || 0;

      // Low stock alert
      if (currentStock < reorderPoint) {
        alerts.push({
          id: `stock-${item._id}`,
          type: 'resource',
          severity: currentStock === 0 ? 'critical' : 'high',
          title: `Low Stock: ${item.name}`,
          description: `Current stock: ${currentStock} ${item.unit}`,
          affectedItem: {
            id: item._id,
            name: item.name,
            type: 'inventory'
          },
          predictedDate: new Date(),
          recommendations: [
            `Reorder immediately`,
            `Recommended order: ${reorderPoint * 2} ${item.unit}`,
            'Check supplier availability'
          ],
          estimatedCost: item.unitPrice * reorderPoint * 2
        });
      }

      // Predict future stockout
      if (averageUsage > 0 && currentStock > 0) {
        const daysUntilStockout = Math.floor((currentStock / averageUsage) * 30);
        
        if (daysUntilStockout < 14) {
          alerts.push({
            id: `forecast-${item._id}`,
            type: 'resource',
            severity: daysUntilStockout < 7 ? 'high' : 'medium',
            title: `${item.name} Running Low`,
            description: `Estimated ${daysUntilStockout} days of stock remaining`,
            affectedItem: {
              id: item._id,
              name: item.name,
              type: 'inventory'
            },
            predictedDate: new Date(Date.now() + daysUntilStockout * 24 * 60 * 60 * 1000),
            recommendations: [
              'Order soon to avoid stockout',
              `Suggested order: ${Math.ceil(averageUsage * 2)} ${item.unit}`
            ],
            estimatedCost: item.unitPrice * Math.ceil(averageUsage * 2)
          });
        }
      }
    }

    return alerts;
  }

  // Get all alerts sorted by priority
  async getAllAlerts(data: {
    equipment?: any[];
    animals?: any[];
    crops?: any[];
    inventory?: any[];
  }): Promise<PredictiveAlert[]> {
    const allAlerts: PredictiveAlert[] = [];

    if (data.equipment) {
      const equipmentAlerts = await this.analyzeEquipmentMaintenance(data.equipment);
      allAlerts.push(...equipmentAlerts);
    }

    if (data.animals) {
      const animalAlerts = await this.analyzeAnimalHealth(data.animals);
      allAlerts.push(...animalAlerts);
    }

    if (data.crops) {
      const cropAlerts = await this.analyzeCropHealth(data.crops);
      allAlerts.push(...cropAlerts);
    }

    if (data.inventory) {
      const resourceAlerts = await this.analyzeResourceLevels(data.inventory);
      allAlerts.push(...resourceAlerts);
    }

    // Sort by severity and date
    return allAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(a.predictedDate).getTime() - new Date(b.predictedDate).getTime();
    });
  }
}

export const predictiveSystem = new PredictiveMaintenanceSystem();
export default predictiveSystem;
