import {
  Document,
  Paragraph,
  Packer,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
  Header,
  ImageRun,
  TextWrappingType,
  TextWrappingSide,
} from "docx";
import axios from "axios";

const downloadImage = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};

export const generateDocx = async (extractedData) => {
  const imageUrl =
    "https://dev-suyash.s3.ap-south-1.amazonaws.com/images/header.png";
  const imageBuffer = await downloadImage(imageUrl);

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              // Centered name
              extractedData?.name
                ? new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: extractedData?.name?.toUpperCase(),
                        bold: true,
                        size: 22,
                        font: "Carlito",
                        color: "808080",
                      }),
                    ],
                  })
                : null,
              // Image on the right
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer,
                    transformation: {
                      width: 100,
                      height: 100,
                    },
                    floating: {
                      horizontalPosition: {
                        relative: "page",
                        align: "right",
                      },
                      verticalPosition: {
                        relative: "page",
                        offset: 0,
                      },
                      wrap: {
                        type: TextWrappingType.SQUARE,
                        side: TextWrappingSide.RIGHT,
                      },
                    },
                  }),
                ],
              }),
            ].filter(Boolean),
          }),
        },
        properties: {},
        children: [
          // PROFESSIONAL SUMMARY with border
          extractedData?.professionalSummary?.length
            ? new Paragraph({
                spacing: {
                  before: 100,
                  after: 100,
                },
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    value: "single",
                    size: 6,
                  },
                },

                children: [
                  new TextRun({
                    text: "PROFESSIONAL SUMMARY",
                    bold: true,
                    size: 22,
                    font: "Arial",
                  }),
                ],
              })
            : null,
          ...(extractedData?.professionalSummary?.map(
            (summary) =>
              new Paragraph({
                bullet: {
                  level: 0,
                },
                spacing: {
                  before: 100,
                  after: 100,
                },
                children: [
                  new TextRun({
                    text: summary,
                    size: 22,
                    font: "Calibri",
                  }),
                ],
              })
          ) || []),
          new Paragraph({
            spacing: {
              before: 300,
            },
          }),
          // TECHNICAL SKILLS with border
          Object.keys(extractedData?.technicalSkills || {}).length
            ? new Paragraph({
                spacing: {
                  after: 200,
                },
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    value: "single",
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "TECHNICAL SKILLS",
                    bold: true,
                    size: 22,
                    font: "Arial",
                  }),
                ],
              })
            : null,
          new Table({
            rows: [
              ...Object.keys(extractedData?.technicalSkills || {}).map(
                (skillCategory) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        shading: {
                          type: ShadingType.CLEAR,
                          color: "ffffff",
                          fill: "d3ddde",
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: skillCategory,
                                size: 22,
                                font: "Calibri",
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text:
                                  extractedData?.technicalSkills?.[
                                    skillCategory
                                  ]?.join(", ") || "",
                                size: 22,
                                font: "Calibri",
                              }),
                            ],
                          }),
                        ],
                        verticalAlign: "center",
                      }),
                    ],
                  })
              ),
            ],
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),
          new Paragraph({
            spacing: {
              before: 300,
            },
          }),
          // WORK EXPERIENCE with border
          extractedData?.workExperience?.length
            ? new Paragraph({
                spacing: {
                  after: 200,
                },
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    value: "single",
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "WORK EXPERIENCE",
                    bold: true,
                    size: 22,
                    font: "Arial",
                  }),
                ],
              })
            : null,
          ...(extractedData?.workExperience?.flatMap((exp) => [
            exp?.Organization
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "Organization: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: exp?.Organization,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
              : null,
            exp?.role
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "Role: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: exp?.role,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
              : null,
            exp?.duration
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "Duration: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: exp?.duration,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                  spacing: {
                    after: 200,
                  },
                })
              : null,
            exp?.responsibilities?.length
              ? new Paragraph({
                  spacing: {
                    after: 150,
                  },
                  children: [
                    new TextRun({
                      text: "Responsibilities: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
              : null,
            ...(exp?.responsibilities?.map(
              (responsibility) =>
                new Paragraph({
                  bullet: {
                    level: 0,
                  },
                  children: [
                    new TextRun({
                      text: responsibility,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
            ) || []),
            new Paragraph({
              spacing: {
                before: 200,
              },
            }),
          ]) || []),
          // PROJECTS with border
          extractedData?.projects?.length
            ? new Paragraph({
                spacing: {
                  after: 200,
                },
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    value: "single",
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "PROJECTS",
                    bold: true,
                    size: 22,
                    font: "Arial",
                  }),
                ],
              })
            : null,
          ...(extractedData?.projects?.flatMap((proj, index) => [
            proj?.project
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: `Project#${index + 1}: `,
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: proj?.project,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
              : null,
            proj?.role
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "Role: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: proj?.role,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
              : null,
            proj?.toolsUsed?.length > 0
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "Tools Used: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: proj?.toolsUsed?.join(", "),
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
              : null,
            proj?.duration
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "Duration: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: proj?.duration,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
              : null,
            // Spacing after Description
            proj?.description
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: "Description: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                    new TextRun({
                      text: proj?.description,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                  spacing: {
                    after: 150,
                  },
                })
              : null,
            proj?.responsibilities?.length
              ? new Paragraph({
                  spacing: {
                    after: 150,
                  },
                  children: [
                    new TextRun({
                      text: "Responsibilities: ",
                      bold: true,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
              : null,
            ...(proj?.responsibilities?.map(
              (responsibility) =>
                new Paragraph({
                  bullet: {
                    level: 0,
                  },
                  children: [
                    new TextRun({
                      text: responsibility,
                      size: 22,
                      font: "Calibri",
                    }),
                  ],
                })
            ) || []),
            new Paragraph({
              spacing: {
                before: 200,
              },
            }),
          ]) || []),
          // EDUCATION with border
          extractedData?.education?.length
            ? new Paragraph({
                spacing: {
                  after: 200,
                  before: 200, 
                },
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    value: "single",
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "EDUCATION",
                    bold: true,
                    size: 22,
                    font: "Arial",
                  }),
                ],
              })
            : null,
          ...(extractedData?.education?.map(
            (edu) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu?.degree || ""} - ${edu?.institution || ""} (${
                      edu?.year || ""
                    })`,
                    size: 22,
                    font: "Calibri",
                  }),
                ],
              })
          ) || []),
          // Space between Education and Certifications
          extractedData?.certifications?.length
            ? new Paragraph({
                spacing: {
                  before: 200, 
                },
              })
            : null,
          // CERTIFICATIONS with border
          extractedData?.certifications?.length
            ? new Paragraph({
                spacing: {
                  after: 200,
                },
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    value: "single",
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "CERTIFICATIONS",
                    bold: true,
                    size: 22,
                    font: "Arial",
                  }),
                ],
              })
            : null,
          ...(extractedData?.certifications?.map(
            (cert) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${cert?.name || ""} - ${cert?.issuer || ""} ${
                      cert?.date || ""
                    }`,
                    size: 22,
                    font: "Calibri",
                  }),
                ],
              })
          ) || []),
        ].filter(Boolean),
      },
    ],
  });

  // Convert the document to buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
};
